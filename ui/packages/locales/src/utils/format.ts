import type { DateFormatOptions, NumberFormatOptions, Locale } from "../types";

/**
 * 格式化日期
 * @param date 日期
 * @param options 格式化选项
 */
export function formatDate(date: Date | number | string, options: DateFormatOptions = {}) {
  const { format = "yyyy-MM-dd", locale = "zh-CN" } = options;
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("yyyy", String(year))
    .replace("MM", month)
    .replace("dd", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 格式化数字
 * @param num 数字
 * @param options 格式化选项
 */
export function formatNumber(num: number, options: NumberFormatOptions = {}) {
  const {
    minPrecision = 0,
    maxPrecision = 2,
    thousandSeparator = ",",
    decimalSeparator = ".",
    locale = "zh-CN",
  } = options;

  // 处理精度
  const fixed = num.toFixed(maxPrecision);
  const [int, dec] = fixed.split(".");

  // 处理千分位
  const intPart = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  // 处理小数部分
  const decPart = dec ? dec.padEnd(minPrecision, "0").slice(0, maxPrecision).replace(/0+$/, "") : "";

  return decPart ? `${intPart}${decimalSeparator}${decPart}` : intPart;
}

/**
 * 格式化货币
 * @param amount 金额
 * @param options 格式化选项
 */
export function formatCurrency(amount: number, options: NumberFormatOptions & { currency?: string } = {}) {
  const { currency = "CNY", locale = "zh-CN" } = options;
  const formatted = formatNumber(amount, options);

  return locale === "zh-CN" ? `¥${formatted}` : `${currency} ${formatted}`;
}
