/**
 * 类型判断工具集
 */

// 基础类型判断
export const isUndefined = (val: unknown): val is undefined => typeof val === "undefined";
export const isNull = (val: unknown): val is null => val === null;
export const isString = (val: unknown): val is string => typeof val === "string";
export const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";
export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol";
export const isBigInt = (val: unknown): val is bigint => typeof val === "bigint";

// 复杂类型判断
export const isFunction = (val: unknown): val is Function => typeof val === "function";
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === "object";
export const isArray = Array.isArray;
export const isDate = (val: unknown): val is Date => val instanceof Date && !isNaN(val.getTime());
export const isRegExp = (val: unknown): val is RegExp => val instanceof RegExp;
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction((val as any).then) && isFunction((val as any).catch);
};

// 特殊类型判断
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!(val as any).tagName;
};
export const isError = (val: unknown): val is Error => val instanceof Error;
export const isWindow = (val: unknown): val is Window => typeof window !== "undefined" && val === window;
export const isMap = (val: unknown): val is Map<any, any> => val instanceof Map;
export const isSet = (val: unknown): val is Set<any> => val instanceof Set;
