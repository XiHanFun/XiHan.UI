/**
 * 数字本地化工具
 */

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  /**
   * 语言区域，如 'zh-CN', 'en-US', 'ja-JP' 等
   */
  locale?: string;

  /**
   * 小数位数
   */
  decimals?: number;

  /**
   * 最小小数位数
   */
  minDecimals?: number;

  /**
   * 最大小数位数
   */
  maxDecimals?: number;

  /**
   * 是否使用千位分隔符
   */
  useGrouping?: boolean;

  /**
   * 格式化风格
   * - decimal: 十进制 (一般数字)
   * - percent: 百分比
   * - unit: 带单位
   */
  style?: "decimal" | "percent" | "unit";

  /**
   * 单位类型 (当 style 为 'unit' 时有效)
   * - 如: 'meter', 'kilometer', 'celsius', 'gram' 等
   */
  unit?: string;

  /**
   * 单位显示方式
   * - long: 完整名称 (如 '米', '千克')
   * - short: 缩写 (如 'm', 'kg')
   * - narrow: 窄版 (如 'm', 'kg')
   */
  unitDisplay?: "long" | "short" | "narrow";

  /**
   * 符号显示形式 (正数、负数、零)
   */
  signDisplay?: "auto" | "always" | "never" | "exceptZero";

  /**
   * 舍入模式
   */
  roundingMode?:
    | "ceil"
    | "floor"
    | "expand"
    | "trunc"
    | "halfCeil"
    | "halfFloor"
    | "halfExpand"
    | "halfTrunc"
    | "halfEven";
}

/**
 * 默认数字格式化选项
 */
const DEFAULT_NUMBER_FORMAT_OPTIONS: NumberFormatOptions = {
  locale: "zh-CN",
  decimals: undefined,
  minDecimals: 0,
  maxDecimals: 3,
  useGrouping: true,
  style: "decimal",
  signDisplay: "auto",
  roundingMode: "halfExpand",
};

/**
 * 常用单位映射表
 */
export interface UnitInfo {
  /**
   * 单位名称（缩写）
   */
  name: string;

  /**
   * 单位显示方式
   */
  display?: "long" | "short" | "narrow";

  /**
   * 单位描述
   */
  description?: string;
}

/**
 * 常用单位
 */
export const COMMON_UNITS: Record<string, UnitInfo> = {
  // 长度单位
  meter: { name: "meter", description: "米" },
  kilometer: { name: "kilometer", description: "千米" },
  centimeter: { name: "centimeter", description: "厘米" },
  millimeter: { name: "millimeter", description: "毫米" },

  // 质量单位
  gram: { name: "gram", description: "克" },
  kilogram: { name: "kilogram", description: "千克" },

  // 体积单位
  liter: { name: "liter", description: "升" },
  milliliter: { name: "milliliter", description: "毫升" },

  // 时间单位
  second: { name: "second", description: "秒" },
  minute: { name: "minute", description: "分钟" },
  hour: { name: "hour", description: "小时" },
  day: { name: "day", description: "天" },
  month: { name: "month", description: "月" },
  year: { name: "year", description: "年" },

  // 温度单位
  celsius: { name: "celsius", description: "摄氏度" },
  fahrenheit: { name: "fahrenheit", description: "华氏度" },

  // 数据单位
  byte: { name: "byte", description: "字节" },
  kilobyte: { name: "kilobyte", description: "千字节" },
  megabyte: { name: "megabyte", description: "兆字节" },
  gigabyte: { name: "gigabyte", description: "吉字节" },
  terabyte: { name: "terabyte", description: "太字节" },

  // 速度单位
  "meter-per-second": { name: "meter-per-second", description: "米/秒" },
  "kilometer-per-hour": { name: "kilometer-per-hour", description: "千米/小时" },
};

/**
 * 格式化数字
 * @param value 数字
 * @param options 格式化选项
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number, options?: Partial<NumberFormatOptions>): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "";
  }

  const opts = { ...DEFAULT_NUMBER_FORMAT_OPTIONS, ...options };
  const { locale, style, unit, unitDisplay, useGrouping, signDisplay, roundingMode } = opts;

  // 设置小数位数
  let minDecimals = opts.minDecimals;
  let maxDecimals = opts.maxDecimals;

  // 如果指定了固定小数位数，则最小和最大小数位数相同
  if (opts.decimals !== undefined) {
    minDecimals = maxDecimals = opts.decimals;
  }

  try {
    const formatOptions: Intl.NumberFormatOptions = {
      style,
      useGrouping,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      signDisplay,
      roundingMode: roundingMode as any,
    };

    // 根据样式添加额外选项
    if (style === "unit" && unit) {
      formatOptions.unit = unit;
      formatOptions.unitDisplay = unitDisplay || "short";
    }

    const formatter = new Intl.NumberFormat(locale, formatOptions);
    return formatter.format(value);
  } catch (error) {
    console.error("数字格式化失败:", error);
    return value.toString();
  }
}

/**
 * 格式化百分比
 * @param value 值（0.01 表示 1%）
 * @param options 格式化选项
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, options?: Partial<NumberFormatOptions>): string {
  return formatNumber(value, {
    style: "percent",
    ...options,
  });
}

/**
 * 格式化带单位的数字
 * @param value 数字
 * @param unit 单位
 * @param options 格式化选项
 * @returns 格式化后的带单位数字字符串
 */
export function formatWithUnit(value: number, unit: string, options?: Partial<NumberFormatOptions>): string {
  return formatNumber(value, {
    style: "unit",
    unit,
    unitDisplay: "short",
    ...options,
  });
}

/**
 * 解析本地化数字字符串为数字
 * @param str 本地化数字字符串
 * @param locale 语言区域
 * @returns 解析后的数字
 */
export function parseNumber(str: string, locale: string = "zh-CN"): number {
  if (!str) return 0;

  // 尝试直接解析
  const parsed = parseFloat(str);
  if (!isNaN(parsed)) return parsed;

  // 特定区域的处理
  try {
    // 移除非数字字符，保留小数点和负号
    const cleanedStr = str.replace(/[^\d.\-,]/g, "");

    // 对于使用逗号作为小数点的区域，例如欧洲地区
    if (["de-DE", "fr-FR", "it-IT", "es-ES"].includes(locale)) {
      return parseFloat(cleanedStr.replace(/\./g, "").replace(/,/g, "."));
    }

    // 对于使用点作为小数点的区域，例如中国、美国
    return parseFloat(cleanedStr.replace(/,/g, ""));
  } catch (error) {
    console.error("数字解析失败:", error);
    return 0;
  }
}

/**
 * 获取区域的数字格式信息
 * @param locale 区域
 * @returns 数字格式信息
 */
export function getNumberFormatInfo(locale: string = "zh-CN"): {
  decimal: string; // 小数点
  group: string; // 千位分隔符
} {
  // 生成一个格式化的数字来检测分隔符
  const formatted = new Intl.NumberFormat(locale).format(1234.5);

  // 找出小数点分隔符
  const decimal = formatted
    .replace(/\d/g, "")
    .trim()
    .charAt(formatted.indexOf("5") - 1);

  // 找出千位分隔符
  const group = formatted.replace(/\d/g, "").trim().charAt(0);

  return { decimal, group };
}

/**
 * 数字舍入
 * @param value 数字
 * @param decimals 小数位数
 * @param mode 舍入模式
 * @returns 舍入后的数字
 */
export function roundNumber(value: number, decimals: number = 0, mode: "ceil" | "floor" | "round" = "round"): number {
  if (isNaN(value)) return 0;

  const factor = Math.pow(10, decimals);

  switch (mode) {
    case "ceil":
      return Math.ceil(value * factor) / factor;
    case "floor":
      return Math.floor(value * factor) / factor;
    case "round":
    default:
      return Math.round(value * factor) / factor;
  }
}

/**
 * 格式化数字为固定长度的字符串
 * @param value 数字
 * @param length 总长度
 * @param padChar 填充字符
 * @returns 格式化后的字符串
 */
export function padNumber(value: number, length: number = 2, padChar: string = "0"): string {
  return value.toString().padStart(length, padChar);
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param locale 区域
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number, locale: string = "zh-CN", decimals: number = 2): string {
  if (bytes === 0) return formatWithUnit(0, "byte", { locale });

  const k = 1024;
  const sizes = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return formatWithUnit(value, sizes[i], { locale, decimals });
}
