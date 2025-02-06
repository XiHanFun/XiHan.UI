// 类型判断相关

/**
 * 检查给定的值是否为字符串
 *
 * @param val 需要检查的值
 * @returns 如果值是字符串，则返回true，否则返回false
 */
export const isString = (val: unknown): val is string => typeof val === "string";

/**
 * 检查给定的值是否为数字
 *
 * @param val 需要检查的值
 * @returns 如果值是数字，则返回true，否则返回false
 */
export const isNumber = (val: unknown): val is number => typeof val === "number";

/**
 * 检查给定的值是否为布尔值
 *
 * @param val 需要检查的值
 * @returns 如果值是布尔值，则返回true，否则返回false
 */
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";

/**
 * 检查给定的值是否为函数
 *
 * @param val 需要检查的值
 * @returns 如果值是函数，则返回true，否则返回false
 */
export const isFunction = (val: unknown): val is Function => typeof val === "function";

/**
 * 检查给定的值是否为对象
 *
 * @param val 需要检查的值
 * @returns 如果值是对象，则返回true，否则返回false
 */

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === "object";

/**
 * 检查给定的值是否为数组
 *
 * @param val 需要检查的值
 * @returns 如果值是数组，则返回true，否则返回false
 */
export const isArray = (val: unknown): val is Array<any> => Array.isArray(val);

/**
 * 检查给定的值是否为日期对象
 *
 * @param val 需要检查的值
 * @returns 如果值是日期对象，则返回true，否则返回false
 */
export const isDate = (val: unknown): val is Date => val instanceof Date;
