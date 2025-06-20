// ============================== 基础类型判断 ==============================

/**
 * 判断值是否为undefined
 * @param val 需要判断的值
 * @returns 如果值为undefined，则返回true，否则返回false
 */
export function isUndefined(val: unknown): val is undefined {
  return typeof val === "undefined";
}

/**
 * 判断值是否为null
 * @param val 需要判断的值
 * @returns 如果值为null，则返回true，否则返回false
 */
export function isNull(val: unknown): val is null {
  return val === null;
}

/**
 * 判断值是否为字符串
 * @param val 需要判断的值
 * @returns 如果值为字符串，则返回true，否则返回false
 */
export function isString(val: unknown): val is string {
  return typeof val === "string";
}

/**
 * 判断值是否为数字
 * @param val 需要判断的值
 * @returns 如果值为数字，则返回true，否则返回false
 */
export function isNumber(val: unknown): val is number {
  return typeof val === "number" && !isNaN(val);
}

/**
 * 判断值是否为布尔值
 * @param val 需要判断的值
 * @returns 如果值为布尔值，则返回true，否则返回false
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === "boolean";
}

/**
 * 判断值是否为符号
 * @param val 需要判断的值
 * @returns 如果值为符号，则返回true，否则返回false
 */
export function isSymbol(val: unknown): val is symbol {
  return typeof val === "symbol";
}

/**
 * 判断值是否为BigInt
 * @param val 需要判断的值
 * @returns 如果值为BigInt，则返回true，否则返回false
 */
export function isBigInt(val: unknown): val is bigint {
  return typeof val === "bigint";
}

// ============================== 复杂类型判断 ==============================

/**
 * 判断值是否为函数
 * @param val 需要判断的值
 * @returns 如果值为函数，则返回true，否则返回false
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

/**
 * 判断值是否为对象
 * @param val 需要判断的值
 * @returns 如果值为对象，则返回true，否则返回false
 */
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === "object";
}

/**
 * 判断值是否为数组
 * @param val 需要判断的值
 * @returns 如果值为数组，则返回true，否则返回false
 */
export function isArray(val: unknown): val is Array<any> {
  return Array.isArray(val);
}

/**
 * 判断值是否为日期
 * @param val 需要判断的值
 * @returns 如果值为日期，则返回true，否则返回false
 */
export function isDate(val: unknown): val is Date {
  return val instanceof Date && !isNaN(val.getTime());
}

/**
 * 判断值是否为正则表达式
 * @param val 需要判断的值
 * @returns 如果值为正则表达式，则返回true，否则返回false
 */
export function isRegExp(val: unknown): val is RegExp {
  return val instanceof RegExp;
}

/**
 * 判断值是否为Promise
 * @param val 需要判断的值
 * @returns 如果值为Promise，则返回true，否则返回false
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return isObject(val) && isFunction((val as any).then) && isFunction((val as any).catch);
}

// ============================== 特殊类型判断 ==============================

/**
 * 判断值是否为DOM元素
 * @param val 需要判断的值
 * @returns 如果值为DOM元素，则返回true，否则返回false
 */
export function isElement(val: unknown): val is Element {
  return isObject(val) && !!(val as any).tagName;
}

/**
 * 判断值是否为错误对象
 * @param val 需要判断的值
 * @returns 如果值为错误对象，则返回true，否则返回false
 */
export function isError(val: unknown): val is Error {
  return val instanceof Error;
}

/**
 * 判断值是否为Window对象
 * @param val 需要判断的值
 * @returns 如果值为Window对象，则返回true，否则返回false
 */
export function isWindow(val: unknown): val is Window {
  return typeof window !== "undefined" && val === window;
}

/**
 * 判断值是否为Map对象
 * @param val 需要判断的值
 * @returns 如果值为Map对象，则返回true，否则返回false
 */
export function isMap(val: unknown): val is Map<any, any> {
  return val instanceof Map;
}

/**
 * 判断值是否为Set对象
 * @param val 需要判断的值
 * @returns 如果值为Set对象，则返回true，否则返回false
 */
export function isSet(val: unknown): val is Set<any> {
  return val instanceof Set;
}

/**
 * 判断值是否为WeakMap对象
 * @param val 需要判断的值
 * @returns 如果值为WeakMap对象，则返回true，否则返回false
 */
export function isWeakMap(val: unknown): val is WeakMap<any, any> {
  return val instanceof WeakMap;
}

/**
 * 判断值是否为WeakSet对象
 * @param val 需要判断的值
 * @returns 如果值为WeakSet对象，则返回true，否则返回false
 */
export function isWeakSet(val: unknown): val is WeakSet<any> {
  return val instanceof WeakSet;
}

/**
 * 判断值是否为File对象
 * @param val 需要判断的值
 * @returns 如果值为File对象，则返回true，否则返回false
 */
export function isFile(val: unknown): val is File {
  return val instanceof File;
}

/**
 * 判断值是否为Blob对象
 * @param val 需要判断的值
 * @returns 如果值为Blob对象，则返回true，否则返回false
 */
export function isBlob(val: unknown): val is Blob {
  return val instanceof Blob;
}

/**
 * 判断值是否为FormData对象
 * @param val 需要判断的值
 * @returns 如果值为FormData对象，则返回true，否则返回false
 */
export function isFormData(val: unknown): val is FormData {
  return val instanceof FormData;
}

/**
 * 判断值是否为URLSearchParams对象
 * @param val 需要判断的值
 * @returns 如果值为URLSearchParams对象，则返回true，否则返回false
 */
export function isURLSearchParams(val: unknown): val is URLSearchParams {
  return val instanceof URLSearchParams;
}

/**
 * 判断值是否为URL对象
 * @param val 需要判断的值
 * @returns 如果值为URL对象，则返回true，否则返回false
 */
export function isURL(val: unknown): val is URL {
  return val instanceof URL;
}

/**
 * 判断值是否为ArrayBuffer对象
 * @param val 需要判断的值
 * @returns 如果值为ArrayBuffer对象，则返回true，否则返回false
 */
export function isArrayBuffer(val: unknown): val is ArrayBuffer {
  return val instanceof ArrayBuffer;
}

/**
 * 判断值是否为DataView对象
 * @param val 需要判断的值
 * @returns 如果值为DataView对象，则返回true，否则返回false
 */
export function isDataView(val: unknown): val is DataView {
  return val instanceof DataView;
}

// ============================== 工具类型 ==============================

/**
 * 深度可选类型
 * 将类型 T 的所有属性（包括嵌套属性）变为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度只读类型
 * 将类型 T 的所有属性（包括嵌套属性）变为只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度必需类型
 * 将类型 T 的所有属性（包括嵌套属性）变为必需
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 获取对象的值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 获取数组元素类型
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * 获取Promise的解析类型
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 可空类型
 */
export type Nullable<T> = T | null;

/**
 * 可选类型
 */
export type Optional<T> = T | undefined;

/**
 * 品牌类型 - 用于类型安全
 */
export type Brand<K, T> = K & { __brand: T };
