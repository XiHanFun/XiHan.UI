/**
 * 货币国际化格式化工具
 */

/**
 * 货币格式化选项
 */
export interface CurrencyFormatOptions {
  /**
   * 货币代码（ISO 4217），如 'CNY', 'USD', 'EUR' 等
   */
  currency?: string;

  /**
   * 语言区域，如 'zh-CN', 'en-US', 'ja-JP' 等
   */
  locale?: string;

  /**
   * 显示风格
   * - code: 货币代码 (例如 CNY)
   * - symbol: 货币符号 (例如 ¥)
   * - name: 货币名称 (例如 人民币)
   */
  style?: "code" | "symbol" | "name";

  /**
   * 是否使用窄版货币符号
   */
  useNarrowSymbol?: boolean;

  /**
   * 小数位数
   */
  decimals?: number;

  /**
   * 是否总是显示小数部分，即使是整数
   */
  alwaysShowDecimals?: boolean;

  /**
   * 分组使用逗号或空格等
   */
  useGrouping?: boolean;
}

/**
 * 货币信息
 */
export interface CurrencyInfo {
  /**
   * 货币代码（ISO 4217）
   */
  code: string;

  /**
   * 货币符号
   */
  symbol: string;

  /**
   * 窄版货币符号（如有）
   */
  narrowSymbol?: string;

  /**
   * 货币名称
   */
  name: string;

  /**
   * 货币小数位数
   */
  decimals: number;

  /**
   * 货币所属国家/地区
   */
  region: string;
}

/**
 * 常用货币信息
 */
export const COMMON_CURRENCIES: Record<string, CurrencyInfo> = {
  CNY: {
    code: "CNY",
    symbol: "¥",
    narrowSymbol: "￥",
    name: "人民币",
    decimals: 2,
    region: "CN",
  },
  USD: {
    code: "USD",
    symbol: "$",
    narrowSymbol: "$",
    name: "美元",
    decimals: 2,
    region: "US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    narrowSymbol: "€",
    name: "欧元",
    decimals: 2,
    region: "EU",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    narrowSymbol: "£",
    name: "英镑",
    decimals: 2,
    region: "GB",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    narrowSymbol: "￥",
    name: "日元",
    decimals: 0,
    region: "JP",
  },
  KRW: {
    code: "KRW",
    symbol: "₩",
    narrowSymbol: "₩",
    name: "韩元",
    decimals: 0,
    region: "KR",
  },
  HKD: {
    code: "HKD",
    symbol: "HK$",
    narrowSymbol: "$",
    name: "港币",
    decimals: 2,
    region: "HK",
  },
  TWD: {
    code: "TWD",
    symbol: "NT$",
    narrowSymbol: "$",
    name: "新台币",
    decimals: 2,
    region: "TW",
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    narrowSymbol: "$",
    name: "新加坡元",
    decimals: 2,
    region: "SG",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    narrowSymbol: "$",
    name: "澳元",
    decimals: 2,
    region: "AU",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    narrowSymbol: "$",
    name: "加元",
    decimals: 2,
    region: "CA",
  },
  RUB: {
    code: "RUB",
    symbol: "₽",
    narrowSymbol: "₽",
    name: "卢布",
    decimals: 2,
    region: "RU",
  },
  INR: {
    code: "INR",
    symbol: "₹",
    narrowSymbol: "₹",
    name: "印度卢比",
    decimals: 2,
    region: "IN",
  },
};

/**
 * 默认货币格式化选项
 */
const DEFAULT_CURRENCY_FORMAT_OPTIONS: CurrencyFormatOptions = {
  currency: "CNY",
  locale: "zh-CN",
  style: "symbol",
  useNarrowSymbol: false,
  decimals: undefined, // 将使用货币默认的小数位数
  alwaysShowDecimals: true,
  useGrouping: true,
};

/**
 * 格式化货币
 * 使用 Intl.NumberFormat 进行本地化格式化
 *
 * @param value 金额
 * @param options 格式化选项
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number, options?: Partial<CurrencyFormatOptions>): string {
  const opts = { ...DEFAULT_CURRENCY_FORMAT_OPTIONS, ...options };
  const { currency, locale, style, useGrouping, alwaysShowDecimals } = opts;
  let { decimals } = opts;

  // 如果未指定小数位数，使用货币默认的小数位数
  if (decimals === undefined) {
    decimals = COMMON_CURRENCIES[currency!]?.decimals ?? 2;
  }

  // 使用 Intl.NumberFormat 格式化货币
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: style,
    minimumFractionDigits: alwaysShowDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
    useGrouping,
  });

  try {
    return formatter.format(value);
  } catch (error) {
    console.error("货币格式化失败:", error);
    return `${value} ${currency}`;
  }
}

/**
 * 解析货币字符串为数字
 * 将格式化的货币字符串转换回数字
 *
 * @param currencyStr 货币字符串
 * @param locale 区域设置
 * @returns 解析后的数字
 */
export function parseCurrency(currencyStr: string, locale: string = "zh-CN"): number {
  if (!currencyStr) return 0;

  // 移除所有货币符号和非数字字符（保留小数点和负号）
  const cleanedStr = currencyStr.replace(/[^\d.-]/g, "");

  // 转换为数字
  return parseFloat(cleanedStr) || 0;
}

/**
 * 获取货币信息
 *
 * @param currencyCode 货币代码
 * @returns 货币信息对象
 */
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
  return COMMON_CURRENCIES[currencyCode.toUpperCase()];
}

/**
 * 获取货币符号
 *
 * @param currencyCode 货币代码
 * @param narrow 是否使用窄版符号
 * @returns 货币符号
 */
export function getCurrencySymbol(currencyCode: string, narrow: boolean = false): string {
  const info = COMMON_CURRENCIES[currencyCode.toUpperCase()];
  if (!info) return currencyCode;

  return narrow && info.narrowSymbol ? info.narrowSymbol : info.symbol;
}

/**
 * 货币转换
 *
 * @param value 金额
 * @param fromCurrency 源货币
 * @param toCurrency 目标货币
 * @param exchangeRate 汇率
 * @returns 转换后的金额
 */
export function convertCurrency(
  value: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number | Record<string, number>,
): number {
  if (!value) return 0;

  // 如果货币相同，则直接返回
  if (fromCurrency === toCurrency) return value;

  // 如果汇率是对象，则获取对应的汇率
  let rate = exchangeRate;
  if (typeof exchangeRate === "object") {
    const key = `${fromCurrency}_${toCurrency}`;
    rate = exchangeRate[key] || 1;
  }

  return value * (rate as number);
}

/**
 * 获取区域对应的默认货币
 *
 * @param locale 区域设置
 * @returns 默认货币代码
 */
export function getLocaleCurrency(locale: string): string {
  const regionMap: Record<string, string> = {
    "zh-CN": "CNY",
    "en-US": "USD",
    "en-GB": "GBP",
    "ja-JP": "JPY",
    "ko-KR": "KRW",
    "zh-HK": "HKD",
    "zh-TW": "TWD",
    "en-SG": "SGD",
    "en-AU": "AUD",
    "en-CA": "CAD",
    "ru-RU": "RUB",
    "hi-IN": "INR",
    "de-DE": "EUR",
    "fr-FR": "EUR",
    "it-IT": "EUR",
    "es-ES": "EUR",
  };

  // 从区域映射表中获取货币
  const region = locale.split("-")[1]?.toUpperCase();
  const defaultCurrency =
    regionMap[locale] || (region ? Object.values(COMMON_CURRENCIES).find(c => c.region === region)?.code : undefined);

  return defaultCurrency || "USD";
}

// 同时提供命名空间对象
export const currency = {
  formatCurrency,
  parseCurrency,
  getCurrencyInfo,
  getCurrencySymbol,
  convertCurrency,
  getLocaleCurrency,
  COMMON_CURRENCIES,
  DEFAULT_CURRENCY_FORMAT_OPTIONS,
};

// 默认导出命名空间对象
export default currency;
