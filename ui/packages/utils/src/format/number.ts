/**
 * 格式化数字（添加千分位）
 */
export const format = (num: number, options: { decimals?: number; separator?: string } = {}): string => {
  const { decimals = 0, separator = "," } = options;
  return Number(num)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * 格式化文件大小
 */
export const formatSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
};

/**
 * 格式化百分比
 */
export const formatPercent = (num: number, decimals = 2): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * 格式化货币
 */
export const formatCurrency = (num: number, options: { currency?: string; locale?: string } = {}): string => {
  const { currency = "CNY", locale = "zh-CN" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(num);
};

/**
 * 数字精度处理
 */
export const round = (num: number, decimals = 0): number => {
  return Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
};

export const numberFormatUtils = {
  format,
  formatSize,
  formatPercent,
  formatCurrency,
  round,
} as const;

export default numberFormatUtils;
