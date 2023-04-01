import { Json } from 'js-game/api-tools';

/**
 * @summary Проверка, является ли значение объектом.
 * Используется в toSnakeCaseFormat и в toCamelCaseFormat.
 */
const isObject = (value: Json): boolean =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * @summary Преобразует строку в snake_case формат.
 */
export const toSnakeCase = (text: string): string => text.replace(/([A-Z])/g, '_$1').toLowerCase();

/**
 * @summary Преобразует ключи объекта в snake_case формат (рекурсивно).
 *
 * @param data - Объект, ключи которого надо трансформировать в формат snake_case.
 */
export const toSnakeCaseFormat = (data: Json): Json => {
  if (Array.isArray(data)) {
    return data.map((item) => toSnakeCaseFormat(item));
  }

  if (isObject(data)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, any>).map(([key, value]) => [
        toSnakeCase(key),
        toSnakeCaseFormat(value),
      ])
    );
  }

  return data;
};

/**
 * @summary Преобразует ключи объекта в camelCase формат (рекурсивно).
 *
 * @param data - Объект, ключи которого надо трансформировать в формат camelCase.
 */
export const toCamelCaseFormat = (data: Json): Json => {
  const toCamelCase = (text: string) => text.replace(/_([a-z])/g, (_, sym) => sym.toUpperCase());

  if (Array.isArray(data)) {
    return data.map((item) => toCamelCaseFormat(item));
  }

  if (isObject(data)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, any>).map(([key, value]) => [
        toCamelCase(key),
        toCamelCaseFormat(value),
      ])
    );
  }

  return data;
};
