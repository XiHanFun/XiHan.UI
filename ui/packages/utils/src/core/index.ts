/**
 * 核心工具模块
 */

// 数组工具
export {
  sum as sumArray,
  average as averageArray,
  max,
  min,
  unique,
  flatten,
  filter,
  map as mapArray,
  groupBy,
  sortBy,
} from "./array";

// 日期工具
export {
  formatDate,
  formatDateToLocale,
  getRelativeTime,
  getRelativeTimeLocaleChina,
  getDateRange,
  getDateStartToEndRange,
  isSameDay,
  getDaysInMonth,
  getDayOfWeek,
  addDays,
  getTimestamp,
  isValidDate,
} from "./date";
export type { DateFormatOptions } from "./date";

// 事件工具
export {
  on,
  off,
  once,
  debounce as debounceEvent,
  throttle as throttleEvent,
  stopPropagation,
  preventDefault,
  getEventTarget,
  createCustomEvent,
  dispatchCustomEvent,
} from "./event";
export type { EventOptions } from "./event";

// 函数工具
export { debounce as debounceFn, throttle as throttleFn, retry, memoize, timeout } from "./function";

// 数学工具
export {
  add,
  subtract,
  multiply,
  divide,
  percentage,
  random,
  clamp,
  round,
  sum as sumMath,
  average as averageMath,
  toRadians,
  toDegrees,
  map,
  inRange,
  randomColor,
  factorial,
  distance,
  isPrime,
  toSignificantDigits,
} from "./math";

// 对象工具
export { deepClone, merge, getType, isEmpty as isEmptyObject, deepMerge, get, set, flattenObject } from "./object";

// 字符串工具
export {
  generateId,
  isEmpty as isEmptyString,
  capitalize,
  unCapitalize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  format,
  template,
  escapeHtml as stringEscapeHtml,
} from "./string";

// 类型工具
export {
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
} from "./types";

// 数字工具
export { format as formatNumber, formatPercent, formatCurrency } from "./number";

// 错误处理工具
export {
  throwError,
  assert,
  assertType,
  assertRequired,
  tryCatch,
  tryCatchAsync,
  formatError,
  contextError,
} from "./error";
export type { ErrorCode, XiHanError } from "./error";
