import axios from 'axios';
import {
  ApiState,
  DestructorType,
  PollingResultSetterType,
  PollingResultState,
  StateSetterType,
} from './types';

const DEBUG = false;
const debug = (...args: [string, ...any[]]) => DEBUG && console.warn(...args);

export const getIsStopPolling = () => window.location.href.includes('polling=');

const idecoEtagHeader = 'x-ideco-etag';

/*
 * Функция, которая занимается вечным поллингом по таймеру, который можно отменить.
 */
const doPolling = (
  url: string,
  idecoEtagGetter: () => string | undefined,
  pollingResultSetter: PollingResultSetterType,
  interval: number,
  untilSuccess: boolean
): DestructorType => {
  let stopped = false;
  let axiosCancel: (() => void) | undefined = undefined;
  const latin1Decoder = new TextDecoder('latin1');
  let stop: (value?: any) => void;
  const stopPromise = new Promise((resolve) => {
    stop = resolve;
  });
  const fetchAndSleep = async () => {
    if (stopped) {
      return;
    }
    const source = axios.CancelToken.source();
    axiosCancel = () => source.cancel();

    try {
      const idecoEtagValue = idecoEtagGetter();
      const response = await axios.get<ArrayBuffer>(url, {
        cancelToken: source.token,
        // Нам нужны сырые данные, чтобы посчитать hash. Hash считается от байтов, а не от строки,
        // и уж естественно, не от объектов. Чтобы это всё работало нормально, бакенд должен отправлять
        // ключи в обьектах всегда в одном и том же порядке. Иначе данный код подумает, что данные поменялись
        // Это не страшно, просто будет не оптимально и приведёт к лишним ре-рендерам.
        responseType: 'arraybuffer',
        headers:
          idecoEtagValue !== undefined && !idecoEtagValue.startsWith('internal-')
            ? {
                [idecoEtagHeader]: idecoEtagValue,
              }
            : undefined,
      });
      axiosCancel = undefined;

      // Можно было сделать это вообще без кода на фронте, с помошью Etag, но хром не отправляет If-None-Match, если запрос отправлен по кривому сертификату
      let hash: string | undefined = response.headers[idecoEtagHeader];

      // Не проверяем на stopped здесь, потому что если поллер был остановлен, то await axios.get() завершился
      // бы исключением.

      if (hash === undefined) {
        // К сожалению, MD5 отсутствует в спецификациях, хотя он самый быстрый.
        // Вообще, хэш можно было бы высчитывать в setPollingResult, но вычисление хэша асинхронное,
        // поэтому считаем его здесь.
        const hashBytes: ArrayBuffer = await crypto.subtle.digest('SHA-1', response.data);

        // stopped мог быть выставлен, пока мы считали хэш
        if (stopped) {
          return;
        }
        hash = 'internal-' + latin1Decoder.decode(hashBytes);
      }

      debug('Setting success state for', url);
      pollingResultSetter({
        rawData: response.data,
        hash,
      });
      if (untilSuccess) {
        debug('untilsuccess, so exitting');
        return;
      }
    } catch (error) {
      axiosCancel = undefined;
      if (axios.isCancel(error)) {
        return;
      }
      pollingResultSetter(undefined);
    }

    let timeout = undefined;
    const sleepPromise = new Promise((resolve) => {
      timeout = setTimeout(resolve, interval);
    });

    await Promise.race([
      sleepPromise, // Ждём таймера между запросами.
      stopPromise, // Ждём срабатывания деструктора.
    ]);
    clearTimeout(timeout); // Передавать undefined в качестве идентификатора таймаута - это валидно по спецификации.

    if (!stopped) {
      fetchAndSleep();
    }
  };
  fetchAndSleep(); // start background coroutine
  return () => {
    stopped = true; // prevent cycle from going next
    if (axiosCancel !== undefined) {
      axiosCancel();
    }
    stop();
  };
};

export const defaultApiState: ApiState = {
  data: undefined,
  hash: undefined,
} as const;

/*
 * Абстракция, позволяющая к одному URL иметь несколько поллингов
 * которые можно останавливать и запускать.
 * */
class PollerInfo {
  private readonly url: string;
  readonly interval: number;
  readonly untilSuccess: boolean;
  readonly location: string;
  private readonly utf8Decoder: TextDecoder;

  // Набор функций, которые будут вызваны поллером при изменении состояния.
  // Добавляются при регистрации.
  private readonly setStates = new Set<StateSetterType>();

  // Сохранённое состояние (результат axios, либо ошибка) нужно для мгновенной отдачи при
  // вторичных регистрациях. Если этого не делать, то вторичные регистрации застрянут на
  // крутилке до ближайшего срабатывания axios.
  private savedState: ApiState = defaultApiState;

  private jsRevision: number = 0;
  private readonly resolveTriggerWaiters: () => void;

  // Функция для остановки поллинга (деструктор)
  private stopPolling: DestructorType | undefined = undefined;
  private isActive: boolean;

  constructor(
    url: string,
    interval: number,
    resolveTriggerWaiters: () => void,
    isActive: boolean,
    untilSuccess: boolean,
    location: string
  ) {
    this.url = url;
    this.interval = interval;
    this.resolveTriggerWaiters = resolveTriggerWaiters;
    this.isActive = isActive;
    this.untilSuccess = untilSuccess;
    this.location = location;
    this.utf8Decoder = new TextDecoder();
  }

  // Обработка новых данных пришедших из doPoller
  private handlePollingResult(pollingResult: PollingResultState | undefined) {
    if (pollingResult === undefined) {
      if (this.savedState.data !== undefined) {
        this.savedState = {
          data: undefined,
          hash: undefined,
        };
        this.setStates.forEach((stateSetter) => stateSetter(this.savedState));
      }
    } else if (pollingResult.hash !== this.savedState.hash) {
      this.savedState = {
        // Здесь помимо декодирования JSON производится преобразование из snake_case в camelCase
        // Нужна именно функция, а не лямбда потому что нужен this
        data: JSON.parse(
          // Ignoring content-type and charset=.... TODO: check charset in header!
          this.utf8Decoder.decode(pollingResult.rawData),
          function (key: string, value: any) {
            const newKey = key.replace(/_([a-z])/g, (_, sym) => sym.toUpperCase());
            if (key === newKey) {
              return value;
            }
            this[newKey] = value;
          }
        ),
        hash: pollingResult.hash,
      };
      this.setStates.forEach((stateSetter) => stateSetter(this.savedState));
    }

    this.jsRevision++;
    // Если кто-то сделал POST/PUT, то у нас все GET триггерятся. и мы ждем, пока они протриггерятся.
    this.resolveTriggerWaiters();
  }

  // Синхронизация внутреннего состояния -- значения переменных
  // с тем, запущен поллер или нет. потму что условия не простые.
  private applyPollingChanges(forceStop: boolean = false) {
    if (this.untilSuccess && this.savedState.data !== undefined) {
      debug('Not applying polling changes since result has been fetched', this.url);
      return;
    }
    if (forceStop || !this.isActive || this.setStates.size === 0) {
      if (this.stopPolling !== undefined) {
        this.stopPolling();
        this.stopPolling = undefined;
      }
    } else {
      if (this.stopPolling === undefined) {
        this.stopPolling = doPolling(
          this.url,
          () => this.savedState.hash,
          (pollingResult: PollingResultState | undefined) =>
            this.handlePollingResult(pollingResult),
          this.interval,
          this.untilSuccess
        );
      }
    }
  }

  getSavedState(): ApiState {
    return this.savedState;
  }

  getJsRevision(): number {
    return this.jsRevision;
  }

  addStateHandler(setState: StateSetterType) {
    this.setStates.add(setState);
    this.applyPollingChanges();
  }

  delStateHandler(setState: StateSetterType): boolean {
    this.setStates.delete(setState);
    this.applyPollingChanges();
    return this.setStates.size === 0;
  }

  setIsActive(isActive: boolean) {
    debug('Changing active state to', isActive, this.url);
    this.isActive = isActive;
    this.applyPollingChanges();
  }

  trigger() {
    this.applyPollingChanges(true);
    this.applyPollingChanges(false);
  }
}

class MegaPoller {
  private readonly url2pollerInfo = new Map<string, PollerInfo>();
  private readonly triggerWaitResolvers = new Set<() => void>();
  private active: boolean = true;

  constructor() {
    if (document.visibilityState !== undefined) {
      document.addEventListener('visibilitychange', () =>
        this.switchVisibility(document.visibilityState)
      );
    }
  }

  register(
    url: string,
    setState: StateSetterType,
    interval: number,
    untilSuccess: boolean,
    location: string
  ): DestructorType {
    if (interval < 100) {
      throw new Error('Too small interval');
    }
    const validateParams = (pi: PollerInfo): PollerInfo => {
      debug('Registering', 'existing', url);
      if (interval !== pi.interval) {
        throw new Error('Unexpected interval');
      }
      if (untilSuccess !== pi.untilSuccess) {
        throw new Error('Unexpected condition');
      }
      return pi;
    };
    const createPoller = (): PollerInfo => {
      debug('Registering', 'NEW', url);
      const pi: PollerInfo = new PollerInfo(
        url,
        interval,
        () => this.resolveTriggerWaiters(),
        this.active,
        untilSuccess,
        location
      );
      this.url2pollerInfo.set(url, pi);
      return pi;
    };
    const pollerInfoPrev: PollerInfo | undefined = this.url2pollerInfo.get(url);
    const pollerInfo: PollerInfo =
      pollerInfoPrev === undefined || pollerInfoPrev.location !== location
        ? createPoller()
        : validateParams(pollerInfoPrev);
    pollerInfo.addStateHandler(setState);

    // При самом первом рендере в хуке useGlobalApi() внутри useState() будет вызвана getInitialState()
    // которая вернёт pollerInfo.getSavedState() (если он был), либо defaultApiState если запрошен уникальный урл.
    // Получается, что самый первый рендер компонента с таким хуком уже получил стейт и вызывать тут
    // setState(pollerInfo.getSavedState()) не нужно.
    // Однако, Это нужно для сброса состояния при смене URL или interval.
    // В этом случае, getInitialState() внутри useState() не будет вызван, потому что не было unmount.
    // А вот деструктор от старого коллбэка в useEffect() и потом, соответственно, новый register() -- будет.
    // Вызывать подчистку стейта при смене урла в деструкторе нельзя, потому что если этот деструктор вызвался
    // из-за unmount (а не из-за изменения URL/interval), то будет вызов setState() на отмаунченном компоненте.
    // В итоге, при самом первом рендере будет потенциально ещё один перерендер (но с тем же стейтом).
    // Неоптимально, но не критично.
    setState(pollerInfo.getSavedState());

    return () => {
      if (pollerInfo.delStateHandler(setState)) {
        debug('Deleting last', url);
        this.url2pollerInfo.delete(url);
        // resolveTriggerWaiters() Обязательно после this.url2pollerInfo.delete(url);
        this.resolveTriggerWaiters();
      } else {
        debug('Deleting non-last', url);
      }
    };
  }

  // Возвращает состояние (принятые данные или ошибку) для урла.
  // Нужно для случаев, когда уже есть поллер для урла, и он спит. В этом случае сразу отдаём состояние которое было.
  getInitialState(url: string, location: string): ApiState {
    const pollerInfo: PollerInfo | undefined = this.url2pollerInfo.get(url);
    return pollerInfo === undefined || pollerInfo.location !== location
      ? defaultApiState
      : pollerInfo.getSavedState();
  }

  // Триггернуть все поллеры урлов и подождать пока закончатся все которые имелись на момент триггерения
  async triggerAndWait() {
    // Сохраним слепок урлов поллеринфо и ревизий.
    // TODO: WeakMap ?
    const snapshot = new Map<string, [PollerInfo, number]>(
      [...this.url2pollerInfo.entries()].map(([url, pollerInfo]) => [
        url,
        [pollerInfo, pollerInfo.getJsRevision()],
      ])
    );
    this.url2pollerInfo.forEach((pollerInfo) => {
      pollerInfo.trigger();
    });
    await new Promise<void>((resolve) => {
      const possibleResolve = () => {
        for (const [newUrl, newPollerInfo] of this.url2pollerInfo.entries()) {
          const [oldPollerInfo, oldRevision] = snapshot.get(newUrl) || [undefined, undefined];
          // В экстремальном кейсе может пропасть поллеринфо и появиться новый с таким же урлом.
          // В этом случае мы его не ждём.
          if (oldPollerInfo !== newPollerInfo) {
            debug('Skipping another pollerinfo', newUrl);
            continue;
          }
          if (oldPollerInfo.untilSuccess) {
            debug('Skipping URL with untilSuccess', newUrl);
            continue;
          }
          if (oldRevision === newPollerInfo.getJsRevision()) {
            debug('Revision is the same, waiting further', newUrl);
            return;
          }
          debug('Revision differs, checking other URLS', newUrl);
        }
        debug('Trigger complete');
        resolve();
        this.triggerWaitResolvers.delete(possibleResolve);
      };
      this.triggerWaitResolvers.add(possibleResolve);
    });
  }

  private switchVisibility(state: string) {
    switch (state) {
      case 'visible':
        this.active = true;
        break;
      case 'hidden':
        this.active = false;
        break;
      default:
        console.warn(`Unknown visibilityState ${state}`);
    }
    for (const pollerInfo of this.url2pollerInfo.values()) {
      pollerInfo.setIsActive(this.active);
    }
  }

  private resolveTriggerWaiters() {
    this.triggerWaitResolvers.forEach((callback) => callback());
  }
}

export const globalPoller = new MegaPoller();
