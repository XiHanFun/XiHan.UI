/**
 * 将数字四舍五入到指定精度
 * @param num 需要四舍五入的数字
 * @param precision 可选参数，表示保留的小数位数，默认为0
 * @returns 返回四舍五入后的数字
 */
export const round = (num: number, precision = 0): number => {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};

/**
 * 格式化数字（添加千分位）
 * @param num 需要格式化的数字
 * @param options 可选参数，表示保留的小数位数，默认为0
 * @returns 返回格式化后的数字
 */
export const format = (num: number, options: { decimals?: number; separator?: string } = {}): string => {
  const { decimals = 0, separator = "," } = options;
  return Number(num)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * 格式化百分比
 * @param num 需要格式化的百分比
 * @param decimals 可选参数，表示保留的小数位数，默认为2
 * @returns 返回格式化后的百分比
 */
export const formatPercent = (num: number, decimals = 2): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * 格式化货币
 * @param num 需要格式化的货币
 * @param options 可选参数，表示货币类型和地区，默认为"CNY"和"zh-CN"
 * @returns 返回格式化后的货币
 */
export const formatCurrency = (num: number, options: { currency?: string; locale?: string } = {}): string => {
  const { currency = "CNY", locale = "zh-CN" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(num);
};

export const numberUtils = {
  round,
  format,
  formatPercent,
  formatCurrency,
} as const;

export default numberUtils;
