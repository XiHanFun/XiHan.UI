/**
 * 工具库入口
 */

// 核心工具
export {
  // 数组工具
  sumArray,
  averageArray,
  max,
  min,
  unique,
  flatten,
  filter,
  mapArray,
  groupBy as groupByArray,
  sortBy as sortByArray,
  // 日期工具
  formatDate as formatDateCore,
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
  type DateFormatOptions,
  // 事件工具
  on,
  off,
  once,
  debounceEvent,
  throttleEvent,
  stopPropagation,
  preventDefault,
  getEventTarget,
  createCustomEvent,
  dispatchCustomEvent,
  // 函数工具
  debounceFn,
  throttleFn,
  retry,
  memoize as memoizeCore,
  timeout,
  // 数学工具
  add,
  subtract,
  multiply,
  divide,
  percentage,
  random,
  clamp,
  round,
  sumMath,
  averageMath,
  toRadians,
  toDegrees,
  map,
  inRange,
  randomColor,
  factorial,
  distance,
  isPrime,
  toSignificantDigits,
  // 对象工具
  deepClone,
  merge,
  getType,
  isEmptyObject,
  deepMerge as deepMergeCore,
  get,
  set,
  flattenObject,
  // 字符串工具
  generateId,
  isEmptyString,
  capitalize,
  unCapitalize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  format,
  template,
  stringEscapeHtml,
  // 类型工具
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
  // 数字工具
  formatNumber as formatNumberCore,
  formatPercent as formatPercentCore,
  formatCurrency as formatCurrencyCore,
  // 错误处理工具
  throwError,
  assert,
  assertType,
  assertRequired,
  tryCatch,
  tryCatchAsync,
  formatError,
  contextError,
} from "./core";

// DOM相关工具
export * from "./dom";

// 浏览器相关工具
export {
  // 剪贴板操作
  copyText,
  copyImage,
  readText,
  readImage,
  checkClipboardPermission,
  // Cookie 操作
  getCookie,
  setCookie,
  removeCookie,
  // 全屏控制
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
  isFullscreen,
  onFullscreenChange,
  // 历史记录
  historyBack,
  historyForward,
  historyGo,
  historyPush,
  historyReplace,
  // 位置信息
  getLocationParams,
  getLocationParamByName,
  gotoLocation,
  reloadLocation,
  // 通知管理
  showNotification,
  showSimpleNotification,
  closeAllNotifications,
  checkNotificationPermission,
  // 存储操作
  getStorage,
  setStorage,
  removeStorage,
  clearStorage,
  // 文件操作
  formatFileSize,
} from "./browser";

// 安全相关工具
export * from "./security";

// 日志相关工具
export * from "./logging";

// Vue相关工具
export * from "./vue";

// 数据处理工具
export {
  formatDate as formatDateData,
  formatNumber as formatNumberData,
  formatPercent as formatPercentData,
  formatCurrency as formatCurrencyData,
  formatRelativeTime as formatRelativeTimeData,
  type CurrencyFormatOptions as CurrencyFormatOptionsData,
  type NumberFormatOptions as NumberFormatOptionsData,
} from "./data";

// 性能优化工具
export * from "./performance";

// 国际化工具
export * from "./i18n";

// 动画工具
export * from "./animation";

// 测试辅助工具
export * from "./testing";
