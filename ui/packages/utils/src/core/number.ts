import { round } from "./math";

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 需要格式化的数字
 * @param decimals 小数位数
 * @param separator 分隔符，默认为','
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, decimals = 0, separator = ","): string {
  const rounded = round(num, decimals).toString();
  const [intPart, decimalPart] = rounded.split(".");

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
}

/**
 * 格式化百分比
 * @param num 需要格式化的百分比
 * @param decimals 可选参数，表示保留的小数位数，默认为2
 * @returns 返回格式化后的百分比
 */
export function formatPercent(num: number, decimals = 2): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * 格式化货币
 * @param num 需要格式化的货币
 * @param options 可选参数，表示货币类型和地区，默认为"CNY"和"zh-CN"
 * @returns 返回格式化后的货币
 */
export function formatCurrency(num: number, options: { currency?: string; locale?: string } = {}): string {
  const { currency = "CNY", locale = "zh-CN" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(num);
}
