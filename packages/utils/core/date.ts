/**
 * 日期工具函数
 */

// 日期格式化选项
export interface DateFormatOptions {
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  weekday?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZone?: string;
  hour12?: boolean;
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param options 格式化选项
 * @param locale 地区
 */
export const formatDate = (
  date: Date | number | string,
  options: DateFormatOptions = {},
  locale: string = "zh-CN"
): string => {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * 获取相对时间描述
 * @param date 目标日期
 * @param now 当前日期，默认为现在
 */
export const getRelativeTime = (date: Date | number | string, now: Date = new Date()): string => {
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
};

/**
 * 获取日期范围
 * @param start 开始日期
 * @param end 结束日期
 */
export const getDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * 判断是否为同一天
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 获取月份的天数
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * 获取日期是星期几
 */
export const getDayOfWeek = (date: Date, locale: string = "zh-CN"): string => {
  return date.toLocaleDateString(locale, { weekday: "long" });
};

/**
 * 日期加减
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 获取时间戳
 */
export const getTimestamp = (date: Date | number | string = new Date()): number => {
  return new Date(date).getTime();
};

/**
 * 检查是否为有效日期
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};
