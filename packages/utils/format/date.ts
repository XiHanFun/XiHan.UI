// 日期处理相关

/**
 * 格式化日期字符串
 *
 * 此函数接受一个日期参数，可以是Date对象、字符串或表示时间的数字，并返回按照指定格式格式化后的日期字符串
 * 如果未提供格式，默认使用"YYYY-MM-DD HH:mm:ss"格式
 *
 * @param date - 日期参数，可以是Date对象、字符串或数字
 * @param format - 日期格式字符串，默认为"YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | number, format = "YYYY-MM-DD HH:mm:ss"): string => {
  // 创建一个新的Date对象，用于获取日期和时间信息
  const d = new Date(date);
  // 获取年份
  const year = d.getFullYear();
  // 获取月份，由于getMonth()返回的月份从0开始，需要加1
  const month = d.getMonth() + 1;
  // 获取日期
  const day = d.getDate();
  // 获取小时
  const hour = d.getHours();
  // 获取分钟
  const minute = d.getMinutes();
  // 获取秒
  const second = d.getSeconds();

  /**
   * 格式化数字
   *
   * 此函数接受一个数字，并返回一个两位字符串如果数字小于10，会在前面补0
   *
   * @param n - 需要格式化的数字
   * @returns 格式化后的两位字符串
   */
  const formatNumber = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // 使用replace方法替换格式字符串中的年、月、日、时、分、秒标记为实际值
  return format
    .replace("YYYY", String(year))
    .replace("MM", formatNumber(month))
    .replace("DD", formatNumber(day))
    .replace("HH", formatNumber(hour))
    .replace("mm", formatNumber(minute))
    .replace("ss", formatNumber(second));
};
