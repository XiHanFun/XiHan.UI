// ============================== 基础类型判断 ==============================

/**
 * 判断值是否为undefined
 * @param val 需要判断的值
 * @returns 如果值为undefined，则返回true，否则返回false
 */
export const isUndefined = (val: unknown): val is undefined => typeof val === "undefined";

/**
 * 判断值是否为null
 * @param val 需要判断的值
 * @returns 如果值为null，则返回true，否则返回false
 */
export const isNull = (val: unknown): val is null => val === null;

/**
 * 判断值是否为字符串
 * @param val 需要判断的值
 * @returns 如果值为字符串，则返回true，否则返回false
 */
export const isString = (val: unknown): val is string => typeof val === "string";

/**
 * 判断值是否为数字
 * @param val 需要判断的值
 * @returns 如果值为数字，则返回true，否则返回false
 */
export const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);

/**
 * 判断值是否为布尔值
 * @param val 需要判断的值
 * @returns 如果值为布尔值，则返回true，否则返回false
 */
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";

/**
 * 判断值是否为符号
 * @param val 需要判断的值
 * @returns 如果值为符号，则返回true，否则返回false
 */
export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol";

/**
 * 判断值是否为BigInt
 * @param val 需要判断的值
 * @returns 如果值为BigInt，则返回true，否则返回false
 */
export const isBigInt = (val: unknown): val is bigint => typeof val === "bigint";

// ============================== 复杂类型判断 ==============================

/**
 * 判断值是否为函数
 * @param val 需要判断的值
 * @returns 如果值为函数，则返回true，否则返回false
 */
export const isFunction = (val: unknown): val is Function => typeof val === "function";

/**
 * 判断值是否为对象
 * @param val 需要判断的值
 * @returns 如果值为对象，则返回true，否则返回false
 */
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === "object";

/**
 * 判断值是否为数组
 * @param val 需要判断的值
 * @returns 如果值为数组，则返回true，否则返回false
 */
export const isArray = Array.isArray;

/**
 * 判断值是否为日期
 * @param val 需要判断的值
 * @returns 如果值为日期，则返回true，否则返回false
 */
export const isDate = (val: unknown): val is Date => val instanceof Date && !isNaN(val.getTime());

/**
 * 判断值是否为正则表达式
 * @param val 需要判断的值
 * @returns 如果值为正则表达式，则返回true，否则返回false
 */
export const isRegExp = (val: unknown): val is RegExp => val instanceof RegExp;

/**
 * 判断值是否为Promise
 * @param val 需要判断的值
 * @returns 如果值为Promise，则返回true，否则返回false
 */
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction((val as any).then) && isFunction((val as any).catch);
};

// ============================== 特殊类型判断 ==============================

/**
 * 判断值是否为DOM元素
 * @param val 需要判断的值
 * @returns 如果值为DOM元素，则返回true，否则返回false
 */
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!(val as any).tagName;
};

/**
 * 判断值是否为错误对象
 * @param val 需要判断的值
 * @returns 如果值为错误对象，则返回true，否则返回false
 */
export const isError = (val: unknown): val is Error => val instanceof Error;

/**
 * 判断值是否为Window对象
 * @param val 需要判断的值
 * @returns 如果值为Window对象，则返回true，否则返回false
 */
export const isWindow = (val: unknown): val is Window => typeof window !== "undefined" && val === window;

/**
 * 判断值是否为Map对象
 * @param val 需要判断的值
 * @returns 如果值为Map对象，则返回true，否则返回false
 */
export const isMap = (val: unknown): val is Map<any, any> => val instanceof Map;

/**
 * 判断值是否为Set对象
 * @param val 需要判断的值
 * @returns 如果值为Set对象，则返回true，否则返回false
 */
export const isSet = (val: unknown): val is Set<any> => val instanceof Set;

/**
 * 判断值是否为WeakMap对象
 * @param val 需要判断的值
 * @returns 如果值为WeakMap对象，则返回true，否则返回false
 */
export const isWeakMap = (val: unknown): val is WeakMap<any, any> => val instanceof WeakMap;

/**
 * 判断值是否为WeakSet对象
 * @param val 需要判断的值
 * @returns 如果值为WeakSet对象，则返回true，否则返回false
 */
export const isWeakSet = (val: unknown): val is WeakSet<any> => val instanceof WeakSet;

/**
 * 判断值是否为File对象
 * @param val 需要判断的值
 * @returns 如果值为File对象，则返回true，否则返回false
 */
export const isFile = (val: unknown): val is File => val instanceof File;

/**
 * 判断值是否为Blob对象
 * @param val 需要判断的值
 * @returns 如果值为Blob对象，则返回true，否则返回false
 */
export const isBlob = (val: unknown): val is Blob => val instanceof Blob;

/**
 * 判断值是否为FormData对象
 * @param val 需要判断的值
 * @returns 如果值为FormData对象，则返回true，否则返回false
 */
export const isFormData = (val: unknown): val is FormData => val instanceof FormData;

/**
 * 判断值是否为URLSearchParams对象
 * @param val 需要判断的值
 * @returns 如果值为URLSearchParams对象，则返回true，否则返回false
 */
export const isURLSearchParams = (val: unknown): val is URLSearchParams => val instanceof URLSearchParams;

/**
 * 判断值是否为URL对象
 * @param val 需要判断的值
 * @returns 如果值为URL对象，则返回true，否则返回false
 */
export const isURL = (val: unknown): val is URL => val instanceof URL;

/**
 * 判断值是否为ArrayBuffer对象
 * @param val 需要判断的值
 * @returns 如果值为ArrayBuffer对象，则返回true，否则返回false
 */
export const isArrayBuffer = (val: unknown): val is ArrayBuffer => val instanceof ArrayBuffer;

/**
 * 判断值是否为DataView对象
 * @param val 需要判断的值
 * @returns 如果值为DataView对象，则返回true，否则返回false
 */
export const isDataView = (val: unknown): val is DataView => val instanceof DataView;

export const typeUtils = {
  isUndefined,
  isNull,
  isString,
  isNumber,
  isBoolean,
  isSymbol,
  isBigInt,
  isFunction,
  isObject,
  isArray,
  isDate,
  isRegExp,
  isPromise,
  isElement,
  isError,
  isWindow,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isFile,
  isBlob,
  isFormData,
  isURLSearchParams,
  isURL,
  isArrayBuffer,
  isDataView,
} as const;

export default typeUtils;
