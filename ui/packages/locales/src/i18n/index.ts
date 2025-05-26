/**
 * 国际化工具集
 */

// 货币国际化工具导出
export {
  formatCurrency as formatCurrencyI18n,
  parseCurrency as parseCurrencyI18n,
  getCurrencyInfo as getCurrencyInfoI18n,
  getCurrencySymbol as getCurrencySymbolI18n,
  convertCurrency as convertCurrencyI18n,
  getLocaleCurrency as getLocaleCurrencyI18n,
  COMMON_CURRENCIES as COMMON_CURRENCIES_I18N,
} from "./currency";
export type { CurrencyFormatOptions, CurrencyInfo } from "./currency";

// 日期国际化工具导出
export {
  formatDate as formatDateI18n,
  formatDateByTemplate as formatDateByTemplateI18n,
  parseDate as parseDateI18n,
  formatRelativeTime as formatRelativeTimeI18n,
  getDateParts as getDatePartsI18n,
  getLocaleDateNames as getLocaleDateNamesI18n,
  isSameDay as isSameDayI18n,
  simpleDateFormat as simpleDateFormatI18n,
  DATE_FORMAT_TEMPLATES as DATE_FORMAT_TEMPLATES_I18N,
  LOCALE_DATE_FORMATS as LOCALE_DATE_FORMATS_I18N,
} from "./date";
export type { DateFormatOptions as DateFormatOptionsI18n, LocaleDateFormat as LocaleDateFormatI18n } from "./date";

// 数字国际化工具导出
export {
  formatNumber as formatNumberI18n,
  formatPercent as formatPercentI18n,
  formatWithUnit as formatWithUnitI18n,
  parseNumber as parseNumberI18n,
  getNumberFormatInfo as getNumberFormatInfoI18n,
  roundNumber as roundNumberI18n,
  padNumber as padNumberI18n,
  formatFileSize as formatFileSizeI18n,
  COMMON_UNITS as COMMON_UNITS_I18N,
} from "./number";
export type { NumberFormatOptions as NumberFormatOptionsI18n, UnitInfo as UnitInfoI18n } from "./number";

// 复数形式处理工具导出
export {
  getPluralRule,
  getPluralFormIndex,
  getPluralFormName,
  selectPluralForm,
  formatPlural,
  createPluralTranslator,
  PLURAL_RULES,
  PLURAL_FORM_INDICES,
} from "./pluralization";
export type { PluralRuleFunction, PluralRuleConfig, PluralForm } from "./pluralization";

// RTL 支持工具导出
export {
  isRTL,
  getDirection,
  getRTLConfig,
  flipValue,
  flipPositionValues,
  flipBoxValues,
  flipBorderRadius,
  flipTransformOrigin,
  flipProperty,
  flipAngle,
  flipTranslate,
  getRTLClassName,
  getRTLHtmlAttributes,
  createRTLStyles,
  autoFlipStyles,
  RTL_LOCALES,
} from "./rtl";
export type { RTLConfig } from "./rtl";
