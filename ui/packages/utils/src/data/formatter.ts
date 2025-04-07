/**
 * 数据格式化工具
 */

/**
 * 数字格式化配置选项
 */
export interface NumberFormatOptions {
  /**
   * 小数位数
   */
  decimals?: number;

  /**
   * 千位分隔符
   */
  thousandsSeparator?: string;

  /**
   * 小数点符号
   */
  decimalSeparator?: string;

  /**
   * 是否四舍五入
   */
  round?: boolean;

  /**
   * 是否填充零
   */
  padZero?: boolean;

  /**
   * 负数格式 (例如 '-100', '(100)', '100-')
   */
  negativeFormat?: "prefix" | "parentheses" | "suffix";
}

/**
 * 货币格式化配置选项
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  /**
   * 货币符号
   */
  currency?: string;

  /**
   * 货币符号位置
   */
  currencyPosition?: "prefix" | "suffix";

  /**
   * 货币符号和数值之间的空格
   */
  currencySpace?: boolean;
}

/**
 * 百分比格式化配置选项
 */
export interface PercentFormatOptions extends NumberFormatOptions {
  /**
   * 是否将小数转换为百分比 (例如 0.1 -> 10%)
   */
  convertDecimal?: boolean;

  /**
   * 百分号和数值之间的空格
   */
  percentSpace?: boolean;
}

/**
 * 日期格式化配置选项
 */
export interface DateFormatOptions {
  /**
   * 日期格式模板
   */
  format?: string;

  /**
   * 区域设置
   */
  locale?: string;

  /**
   * 是否使用24小时制
   */
  hour24?: boolean;
}

/**
 * 数字单位简化配置选项
 */
export interface CompactNumberOptions extends NumberFormatOptions {
  /**
   * 单位模式
   */
  unitDisplay?: "short" | "long";

  /**
   * 显示精度，小于此精度则显示原值
   */
  precision?: number;

  /**
   * 自定义单位
   */
  units?: Array<{
    /**
     * 单位名称
     */
    name: string;

    /**
     * 单位值 (10^n)
     */
    value: number;
  }>;
}

/**
 * 默认的数字格式化配置
 */
const DEFAULT_NUMBER_FORMAT: NumberFormatOptions = {
  decimals: 2,
  thousandsSeparator: ",",
  decimalSeparator: ".",
  round: true,
  padZero: false,
  negativeFormat: "prefix",
};

/**
 * 默认的货币格式化配置
 */
const DEFAULT_CURRENCY_FORMAT: CurrencyFormatOptions = {
  ...DEFAULT_NUMBER_FORMAT,
  currency: "¥",
  currencyPosition: "prefix",
  currencySpace: false,
};

/**
 * 默认的百分比格式化配置
 */
const DEFAULT_PERCENT_FORMAT: PercentFormatOptions = {
  ...DEFAULT_NUMBER_FORMAT,
  decimals: 2,
  convertDecimal: true,
  percentSpace: false,
};

/**
 * 默认的日期格式化配置
 */
const DEFAULT_DATE_FORMAT: DateFormatOptions = {
  format: "YYYY-MM-DD",
  locale: "zh-CN",
  hour24: true,
};

/**
 * 默认的数字单位简化配置
 */
const DEFAULT_COMPACT_NUMBER: CompactNumberOptions = {
  ...DEFAULT_NUMBER_FORMAT,
  unitDisplay: "short",
  precision: 3,
  decimals: 1,
  units: [
    { name: "", value: 1 },
    { name: "千", value: 1000 },
    { name: "万", value: 10000 },
    { name: "亿", value: 100000000 },
    { name: "兆", value: 1000000000000 },
  ],
};

/**
 * 格式化数字
 * @param value 要格式化的数字
 * @param options 格式化配置选项
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, options: Partial<NumberFormatOptions> = {}): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  const opts = { ...DEFAULT_NUMBER_FORMAT, ...options };
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // 四舍五入或截断
  let formattedValue = opts.round
    ? parseFloat(absValue.toFixed(opts.decimals))
    : Math.floor(absValue * Math.pow(10, opts.decimals!)) / Math.pow(10, opts.decimals!);

  // 转换为字符串并分离整数和小数部分
  const parts = formattedValue.toString().split(".");
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1] : "";

  // 添加千位分隔符
  if (opts.thousandsSeparator) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandsSeparator);
  }

  // 填充小数位
  if (opts.padZero && opts.decimals! > 0) {
    decimalPart = decimalPart.padEnd(opts.decimals!, "0");
  }

  // 组合整数和小数部分
  let result = decimalPart ? `${integerPart}${opts.decimalSeparator}${decimalPart}` : integerPart;

  // 处理负数格式
  if (isNegative) {
    switch (opts.negativeFormat) {
      case "prefix":
        result = `-${result}`;
        break;
      case "parentheses":
        result = `(${result})`;
        break;
      case "suffix":
        result = `${result}-`;
        break;
    }
  }

  return result;
}

/**
 * 格式化货币
 * @param value 要格式化的数字
 * @param options 格式化配置选项
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number, options: Partial<CurrencyFormatOptions> = {}): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  const opts = { ...DEFAULT_CURRENCY_FORMAT, ...options };
  const formattedNumber = formatNumber(value, opts);

  // 添加货币符号
  const space = opts.currencySpace ? " " : "";

  if (opts.currencyPosition === "prefix") {
    return `${opts.currency}${space}${formattedNumber}`;
  } else {
    return `${formattedNumber}${space}${opts.currency}`;
  }
}

/**
 * 格式化百分比
 * @param value 要格式化的数字
 * @param options 格式化配置选项
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, options: Partial<PercentFormatOptions> = {}): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  const opts = { ...DEFAULT_PERCENT_FORMAT, ...options };

  // 将小数转换为百分比
  if (opts.convertDecimal) {
    value = value * 100;
  }

  const formattedNumber = formatNumber(value, opts);
  const space = opts.percentSpace ? " " : "";

  return `${formattedNumber}${space}%`;
}

/**
 * 格式化大数字（添加单位）
 * @param value 要格式化的数字
 * @param options 格式化配置选项
 * @returns 格式化后的字符串
 */
export function formatCompactNumber(value: number, options: Partial<CompactNumberOptions> = {}): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  const opts = { ...DEFAULT_COMPACT_NUMBER, ...options };
  const absValue = Math.abs(value);

  // 如果数值小于精度，直接返回格式化的数字
  if (absValue < opts.precision!) {
    return formatNumber(value, opts);
  }

  // 查找适合的单位
  let unit = opts.units![0];

  for (let i = opts.units!.length - 1; i >= 0; i--) {
    if (absValue >= opts.units![i].value) {
      unit = opts.units![i];
      break;
    }
  }

  // 转换数值
  const convertedValue = value / unit.value;

  // 格式化数字
  const formattedNumber = formatNumber(convertedValue, opts);

  // 添加单位
  return unit.name ? `${formattedNumber} ${unit.name}` : formattedNumber;
}

/**
 * 检查并格式化数值，如果不是有效数值则返回默认值
 * @param value 要检查的值
 * @param defaultValue 默认值
 * @param options 格式化配置选项
 * @returns 格式化后的字符串
 */
export function safeFormatNumber(
  value: any,
  defaultValue: string = "",
  options: Partial<NumberFormatOptions> = {},
): string {
  const num = parseFloat(value);
  return !isNaN(num) ? formatNumber(num, options) : defaultValue;
}

/**
 * 格式化数字为文件大小
 * @param bytes 字节数
 * @param options 格式化配置选项
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, options: Partial<NumberFormatOptions> = {}): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const opts = { ...DEFAULT_NUMBER_FORMAT, ...options, decimals: options.decimals ?? 2 };

  return `${formatNumber(bytes / Math.pow(k, i), opts)} ${sizes[i]}`;
}

/**
 * 简单的日期格式化（不依赖外部库）
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = "YYYY-MM-DD"): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  // 获取日期各部分
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const milliseconds = d.getMilliseconds();

  // 格式化小时（12小时制）
  const hours12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";

  // 替换格式字符串中的占位符
  return format
    .replace(/YYYY/g, year.toString())
    .replace(/YY/g, (year % 100).toString().padStart(2, "0"))
    .replace(/MM/g, month.toString().padStart(2, "0"))
    .replace(/M/g, month.toString())
    .replace(/DD/g, day.toString().padStart(2, "0"))
    .replace(/D/g, day.toString())
    .replace(/HH/g, hours.toString().padStart(2, "0"))
    .replace(/H/g, hours.toString())
    .replace(/hh/g, hours12.toString().padStart(2, "0"))
    .replace(/h/g, hours12.toString())
    .replace(/mm/g, minutes.toString().padStart(2, "0"))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, seconds.toString().padStart(2, "0"))
    .replace(/s/g, seconds.toString())
    .replace(/SSS/g, milliseconds.toString().padStart(3, "0"))
    .replace(/A/g, ampm)
    .replace(/a/g, ampm.toLowerCase());
}

/**
 * 格式化相对时间（如：3小时前）
 * @param date 日期对象或时间戳
 * @param baseDate 基准日期，默认为当前时间
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(
  date: Date | number | string,
  baseDate: Date | number | string = new Date(),
): string {
  const d1 = new Date(date);
  const d2 = new Date(baseDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return "";
  }

  const diff = d2.getTime() - d1.getTime();
  const diffAbs = Math.abs(diff);
  const isFuture = diff < 0;

  // 不同时间单位的毫秒数
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // 根据时间差确定最合适的单位
  let value: number;
  let unit: string;

  if (diffAbs < minute) {
    return "刚刚";
  } else if (diffAbs < hour) {
    value = Math.floor(diffAbs / minute);
    unit = "分钟";
  } else if (diffAbs < day) {
    value = Math.floor(diffAbs / hour);
    unit = "小时";
  } else if (diffAbs < week) {
    value = Math.floor(diffAbs / day);
    unit = "天";
  } else if (diffAbs < month) {
    value = Math.floor(diffAbs / week);
    unit = "周";
  } else if (diffAbs < year) {
    value = Math.floor(diffAbs / month);
    unit = "个月";
  } else {
    value = Math.floor(diffAbs / year);
    unit = "年";
  }

  return isFuture ? `${value} ${unit}后` : `${value} ${unit}前`;
}

/**
 * 格式化银行卡号（每4位添加空格）
 * @param cardNumber 银行卡号
 * @returns 格式化后的银行卡号
 */
export function formatBankCard(cardNumber: string): string {
  if (!cardNumber) return "";

  // 移除所有非数字字符
  const cleaned = cardNumber.replace(/\D/g, "");

  // 每4位添加空格
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * 格式化手机号码
 * @param phoneNumber 手机号码
 * @param format 格式模板，默认：XXX-XXXX-XXXX
 * @returns 格式化后的手机号码
 */
export function formatPhoneNumber(phoneNumber: string, format: string = "XXX-XXXX-XXXX"): string {
  if (!phoneNumber) return "";

  // 移除所有非数字字符
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 0) return "";

  let result = format;
  let digitIndex = 0;

  // 替换X为数字
  for (let i = 0; i < result.length && digitIndex < digits.length; i++) {
    if (result[i] === "X") {
      result = result.substring(0, i) + digits[digitIndex] + result.substring(i + 1);
      digitIndex++;
    }
  }

  // 如果还有剩余的数字，追加到末尾
  if (digitIndex < digits.length) {
    result += digits.substring(digitIndex);
  }

  return result;
}

/**
 * 隐藏敏感信息（如手机号、邮箱等）
 * @param text 原始文本
 * @param visibleStartChars 起始可见字符数
 * @param visibleEndChars 结尾可见字符数
 * @param mask 遮罩字符
 * @returns 遮罩后的文本
 */
export function maskSensitiveInfo(
  text: string,
  visibleStartChars: number = 3,
  visibleEndChars: number = 4,
  mask: string = "*",
): string {
  if (!text) return "";

  const textLength = text.length;

  if (textLength <= visibleStartChars + visibleEndChars) {
    return text;
  }

  const start = text.substring(0, visibleStartChars);
  const end = text.substring(textLength - visibleEndChars);
  const masked = mask.repeat(Math.min(5, textLength - visibleStartChars - visibleEndChars));

  return `${start}${masked}${end}`;
}
