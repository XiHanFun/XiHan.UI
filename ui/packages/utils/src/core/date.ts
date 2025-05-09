/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  // 日期样式 样式：full 完整日期，long 长日期，medium 中等日期，short 短日期
  dateStyle?: "full" | "long" | "medium" | "short";
  // 时间样式 样式：full 完整时间，long 长时间，medium 中等时间，short 短时间
  timeStyle?: "full" | "long" | "medium" | "short";
  // 星期样式 样式：long 长星期，short 短星期，narrow 窄星期
  weekday?: "long" | "short" | "narrow";
  // 年份样式 样式：numeric 数字，2-digit 两位数字
  year?: "numeric" | "2-digit";
  // 月份样式 样式：numeric 数字，2-digit 两位数字，long 长月份，short 短月份，narrow 窄月份
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  // 日期样式 样式：numeric 数字，2-digit 两位数字
  day?: "numeric" | "2-digit";
  // 小时样式 样式：numeric 数字，2-digit 两位数字
  hour?: "numeric" | "2-digit";
  // 分钟样式 样式：numeric 数字，2-digit 两位数字
  minute?: "numeric" | "2-digit";
  // 秒样式 样式：numeric 数字，2-digit 两位数字
  second?: "numeric" | "2-digit";
  // 时区
  timeZone?: string;
  // 是否使用12小时制
  hour12?: boolean;
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式化格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format = "YYYY-MM-DD HH:mm:ss"): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  const formatNumber = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return format
    .replace("YYYY", String(year))
    .replace("MM", formatNumber(month))
    .replace("DD", formatNumber(day))
    .replace("HH", formatNumber(hour))
    .replace("mm", formatNumber(minute))
    .replace("ss", formatNumber(second));
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param options 格式化选项
 * @param locale 地区
 * @returns 格式化后的日期字符串
 */
export function formatDateToLocale(
  date: Date | number | string,
  options: DateFormatOptions = {},
  locale: string = "zh-CN",
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * 获取相对时间描述
 * @param date 目标日期
 * @param now 当前日期，默认为现在
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | number | string, now: Date = new Date()): string {
  const targetDate = new Date(date);
  const diff = now.getTime() - targetDate.getTime();
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return rtf.format(-years, "year");
  if (months > 0) return rtf.format(-months, "month");
  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}

/**
 * 相对时间
 * @param date 日期
 * @returns 相对时间
 */
export function getRelativeTimeLocaleChina(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < month) return `${Math.floor(diff / day)}天前`;
  if (diff < year) return `${Math.floor(diff / month)}个月前`;
  return `${Math.floor(diff / year)}年前`;
}

/**
 * 获取日期范围
 * @param start 开始日期
 * @param end 结束日期
 * @returns 日期范围
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 获取日期起始范围
 * @param date 日期
 * @param unit 单位
 * @returns 日期起始范围
 */
export function getDateStartToEndRange(date: Date, unit: "year" | "month" | "week" | "day"): [Date, Date] {
  const d = new Date(date);
  let start: Date;
  let end: Date;

  switch (unit) {
    case "year":
      start = new Date(d.getFullYear(), 0, 1);
      end = new Date(d.getFullYear() + 1, 0, 0);
      break;
    case "month":
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      break;
    case "week":
      const day = d.getDay() || 7;
      start = new Date(d.setDate(d.getDate() - day + 1));
      end = new Date(d.setDate(d.getDate() + 6));
      break;
    case "day":
      start = new Date(d.setHours(0, 0, 0, 0));
      end = new Date(d.setHours(23, 59, 59, 999));
      break;
  }

  return [start, end];
}

/**
 * 判断是否为同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 获取月份的天数
 * @param year 年份
 * @param month 月份
 * @returns 月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取日期是星期几
 * @param date 日期
 * @param locale 地区
 * @returns 星期几
 */
export function getDayOfWeek(date: Date, locale: string = "zh-CN"): string {
  return date.toLocaleDateString(locale, { weekday: "long" });
}

/**
 * 日期加减
 * @param date 日期
 * @param days 天数
 * @returns 加减后的日期
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 获取时间戳
 * @param date 日期
 * @returns 时间戳
 */
export function getTimestamp(date: Date | number | string = new Date()): number {
  return new Date(date).getTime();
}

/**
 * 检查是否为有效日期
 * @param date 日期
 * @returns 是否为有效日期
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
