import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toSnakeCase, toSnakeCaseFormat } from '../utils/formatters';
import { ApiState, CollectionRecordType, Json, MappedCollectionType } from './types';
import { getIsStopPolling, globalPoller } from './utils';

/**
 * @summary Функция, формирующая url для get запросов с использованием encodeURIComponent
 * для избежания неожиданных запросов к серверу.
 *
 * @param url - Ссылка, по которой можно get запросом получить данные. Может быть относительной.
 * @param parameters - Query parameters для get запроса. Порядок не имеет значения, ключи будут отсортированы.
 **/
export const makeUrlWithParams = (url: string, parameters: Record<string, any>): string => {
  const searchParams = new URLSearchParams(
    Object.entries(parameters)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [
        toSnakeCase(key),
        typeof value === 'object' ? JSON.stringify(toSnakeCaseFormat(value)) : value.toString(),
      ])
  );
  searchParams.sort();
  return `${url}?${searchParams}`;
};

/**
 * @summary Хук для получения данных с бекенда.
 *
 * @param url - Ссылка, по которой можно get запросом получить данные. Может быть относительной.
 * @param interval - Интервал обновление данных в миллисекундах. Не менее 100.
 *                    Если указано значение undefined, то берется значение по умолчанию - 3000.
 * @param untilSuccess - Остановиться ли после успешного получения данных.
 *                       Если true, то после однократного успешного получения данных,
 *                       повторных получений не будет. Однако, при ошибке, повтор будет через
 *                       `interval` ms.
 *
 * @description
 * Занимается получением данных с бакенда. Запрашивает данные сразу же, а также
 * получает их периодически. При получении меняется стейт. Период получения данных
 * настраивается, по умолчанию равен 3 секундам. Данные могут быть получены вне
 * очереди, если происходит вызов глобального триггера. Триггер вызывается в
 * useAction(). Перезапрос данных производится даже если предыдущий запрос
 * закончился ошибкой.
 *
 * При использовании нескольких useGlobalApi с одинаковым URL одновременно в
 * нескольких компонентах, дублирующихся AJAX не будет. Соответственно, при
 * запросе данных будет вызван setState() сразу во всех компонентах, которые
 * запросили такой URL. В частности, если добавляется компонент с указанием URL,
 * который уже в данный момент используется и по которому уже есть результат,
 * то этот компонент сразу же получит данные (либо ошибку) без выполнения AJAX-запроса.
 *
 * Хук корректно отрабатывает unmount и смену параметров. При этом отменяются
 * AJAX-запросы и отменяются таймеры. Никакой ручной подчистки не требуется.
 *
 * Poller объявлен устаревшим и в данной парадигме не нужен.
 *
 * Хук сделан с расчётом на будущее использование вебсокетов.
 *
 * При переключении вкладки в браузере в фон, поллинг автоматически
 * останавливается и возвращается обратно, когда активируется вкладка.
 *
 * Состояние представляет собой кортеж из следующих полей:
 *   Data:
 *     данные, пришедшие с бакенда. Преобразование из snake_case -> CamelCase
 *     делается автоматически. `undefined`, если данные ещё не получены (в
 *     процессе получения), либо если произошла ошибка. Принципиально нет
 *     возможности указать дефолтные данные для стейта.
 *
 *   Err:
 *     Объект-исключение. `undefined`, если данные ещё не получены (в
 *     процессе получения), либо если данные успешно получены.
 *
 *   Одновременно заполненными `data` и `err` быть не может.
 *
 * @example
 * Пример на получение данных по /web/external_access с параметром userId
 * равным 5 и интервалом обновление в 10 000 мс.
 *
 * type WebExternalSetting = { someField: boolean };
 * const MyComponent: FC = () => {
 *   const [data, err] = useGlobalApi<WebExternalSetting>(
 *     '/web/external_access',
 *     10000
 *   );
 *
 *   // Проверять не обязательно. Можно не делать если не нужно отбражать состояние ошибки.
 *   if (err !== undefined)
 *     return `Error getting URL: ${err.toString()}`;
 *
 *   // Проверять обязательно, потому что иначе невозможно произвести рендер.
 *   if (data === undefined)
 *     return <Loader />;
 *
 *   // Если поллинг внутри useGlobalApi вернул те же данные, что и в прошлый раз,
 *   // то `setState()` вызван не будет, но ре-рендер может случиться из-за
 *   // изменения пропсов или других хуков. В этом случае разумно не вычислять
 *   // каждый раз сложные функции, такие как поиск, сортировка, джойн и др:
 *   // Важно! не смотря на то, что `data` это не примитивный тип, сравнение будет
 *   // работать нормально, потому что из useGlobalApi вернётся ровно тот же объект.
 *   const someValue = useMemo(
 *     () => CPUIntensiveCalculation(data.someField),
 *     [data]
 *   );
 *
 *   return (
 *     <SomeComponent value={someValue} />
 *   );
 * }
 */
export const useGlobalApi = <T extends Json>(
  url: string,
  interval: number = 3000,
  untilSuccess: boolean = false
) => {
  const location = useLocation();

  const [state, setState] = useState<ApiState>(() =>
    globalPoller.getInitialState(url, location.pathname)
  );

  useEffect(
    () =>
      globalPoller.register(
        url,
        setState,
        interval,
        getIsStopPolling() || untilSuccess,
        location.pathname
      ),
    [url, interval, untilSuccess]
  );

  return [state.data as T] as const;
};

/**
 * @summary Хук для получения данных с бекенда в виде индексируемой коллекции.
 *
 * @description
 * Занимается получением данных с бакенда через useGlobalApi.
 * Аргументы те же, но формат выходных данных другой.
 * Данный хук будет возвращать Map в котором в качестве индекса используется
 * поле id из каждого элемента переданной с бакенда коллекции.
 *
 * Это может потребоваться если нужно получить коллекцию с целью последующего
 * объединения (join) с другой коллекцией.
 *
 * В типизации дженерика нужно указывать тип данных для одной записи.
 * Подразумевается, что бакенд будет возвращать список записей.
 */
export const useMapGlobalApi = <T extends CollectionRecordType>(
  ...args: Parameters<typeof useGlobalApi>
) => {
  const [data] = useGlobalApi<T[]>(...args);

  const mapping = useMemo<MappedCollectionType<T> | undefined>(
    () =>
      data === undefined
        ? undefined
        : new Map<T['id'], T>(data.map((record) => [record.id, record])),
    [data]
  );

  return [mapping] as const;
};

/**
 * @summary Хук для оборачивания функций изменяющих данные на бекенде.
 *
 * @param actions - Асинхронные функции для получения данных.
 *
 * @description
 * Добавляет глобальный тригер для обновления данных во всех поллерах, отрендеренных на странице.
 * Во время вызова ожидаем обновление данных на бекенде, потом тригерим поллеры и ждем их.
 * Только тогда функция будет выполнена.
 * Удобно использовать в <IdecoFormik onSubmit />.
 *
 * @example
 * Action должен возвращать промис.
 *
 * export const changeAdminPassword = async (password, id) => { await axios.put(`${URL}/${id}/change_pass`, { password }); } // OK
 * export const changeAdminPassword = (password, id) => axios.put(`${URL}/${id}/change_pass`, { password }); // идеально
 * export const changeAdminPassword = async (password, id) => { axios.put(`${URL}/${id}/change_pass`, { password }); } // FAIL (но никто почти не сругнётся)
 * export const changeAdminPassword = async (password, id) => axios.put(`${URL}/${id}/change_pass`, { password }); // FAIL - аналогично
 * export const changeAdminPassword = (password, id) => { axios.put(`${URL}/${id}/change_pass`, { password }); } // FAIL
 *
 * Пример для оборачивания асинхронной функции changeAdminPassword для получения данных.
 * При вызове actions.changeAdminPassword произойдет обновление всех поллеров.
 * const actions = useAction({ changeAdminPassword });
 *
 * Пример с формиком
 * const FormPassword: FC<Props> = ({ adminId, login, closeForm }) => {
 *   const actions = useAction({ changeAdminPassword });
 *   return (
 *     <IdecoFormik
 *       initialValues={{ password: '' }}
 *       onSubmit={async (values) => {
 *         await actions.changeAdminPassword(values.password, adminId);
 *         closeForm();
 *       }}
 *     >
 *       {({ isSubmitting }) => (
 *         <Form>
 *           <PasswordWithButtons eye generate copy />
 *           <SaveAndCancelButtons isLoading={isSubmitting} onClickCancelAction={closeForm} />
 *         </Form>
 *       )}
 *     </IdecoFormik>
 *   );
 * };
 *
 */
export const useAction = <T extends Record<string, (...arg: any) => Promise<any>>>(actions: T) => {
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(actions).map(([actionName, actionFun]) => [
          actionName,
          async (...arg) => {
            try {
              return await actionFun(...arg);
            } finally {
              await globalPoller.triggerAndWait();
            }
          },
        ])
      ) as Readonly<T>,
    []
  );
};

type GlobalApiParams = Parameters<typeof useGlobalApi>;
/**
 * @summary Обвзяка над useGlobalApi, позволяющая изменять url,
 * не обнуляя старые данные.
 */
export const useMutableGlobalApi = <DataType extends Json>(...globalApiParams: GlobalApiParams) => {
  const [nextData] = useGlobalApi<DataType>(...globalApiParams);
  const dataRef = useRef<DataType>(nextData);

  if (nextData !== undefined) {
    dataRef.current = nextData;
  }

  return [dataRef.current] as const;
};
