/**
 * 核心工具模块
 */

// 数组工具
export {
  sum as sumArray,
  average as averageArray,
  max,
  min,
  unique as uniqueArray,
  flatten as flattenArray,
  filter as filterArray,
  map as mapArray,
  groupBy as groupByArray,
  sortBy as sortByArray,
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
  XiHanError,
} from "./error";
export type { ErrorCode } from "./error";

// 事件工具
export {
  on as onEvent,
  off as offEvent,
  once as onceEvent,
  debounce as debounceEvent,
  throttle as throttleEvent,
  stopPropagation as stopPropagationEvent,
  preventDefault as preventDefaultEvent,
  getEventTarget as getEventTargetEvent,
  createCustomEvent as createCustomEventEvent,
  dispatchCustomEvent as dispatchCustomEventEvent,
} from "./event";
export type { EventOptions as EventOptionsEvent } from "./event";

// 函数工具
export {
  debounce as debounceFn,
  throttle as throttleFn,
  retry,
  memoize as memoizeFn,
  timeout as timeoutFn,
} from "./function";

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

// 数字工具
export { formatPercent, formatCurrency, formatNumber } from "./number";

// 对象工具
export {
  deepClone as deepCloneObject,
  merge as mergeObject,
  getType as getTypeObject,
  isEmpty as isEmptyObject,
  deepMerge as deepMergeObject,
  get as getObject,
  set as setObject,
  flattenObject,
} from "./object";

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
  formatString,
  template,
  escapeHtml,
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
