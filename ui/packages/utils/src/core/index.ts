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

export { debounce as debounceFn, throttle as throttleFn, retry, memoize, timeout } from "./function";

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

export { deepClone, merge, getType, isEmpty as isEmptyObject, deepMerge, get, set, flattenObject } from "./object";

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

export { format as formatNumber, formatPercent, formatCurrency } from "./number";
