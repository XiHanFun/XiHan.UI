/**
 * 日期本地化工具
 */

/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  /**
   * 语言区域，如 'zh-CN', 'en-US', 'ja-JP' 等
   */
  locale?: string;

  /**
   * 日期风格
   * - full: 完整日期 (2023年4月7日 星期五)
   * - long: 长日期 (2023年4月7日)
   * - medium: 中等日期 (2023-04-07)
   * - short: 短日期 (23/04/07)
   */
  dateStyle?: "full" | "long" | "medium" | "short";

  /**
   * 时间风格
   * - full: 完整时间 (下午1点30分45秒 中国标准时间)
   * - long: 长时间 (下午1点30分45秒)
   * - medium: 中等时间 (13:30:45)
   * - short: 短时间 (13:30)
   */
  timeStyle?: "full" | "long" | "medium" | "short";

  /**
   * 是否显示年份
   */
  year?: "numeric" | "2-digit";

  /**
   * 是否显示月份
   */
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";

  /**
   * 是否显示日期
   */
  day?: "numeric" | "2-digit";

  /**
   * 是否显示星期
   */
  weekday?: "long" | "short" | "narrow";

  /**
   * 是否显示小时
   */
  hour?: "numeric" | "2-digit";

  /**
   * 是否显示分钟
   */
  minute?: "numeric" | "2-digit";

  /**
   * 是否显示秒钟
   */
  second?: "numeric" | "2-digit";

  /**
   * 是否显示时区
   */
  timeZoneName?: "long" | "short";

  /**
   * 小时制式
   * - 12: 12小时制
   * - 24: 24小时制
   */
  hour12?: boolean;

  /**
   * 时区
   */
  timeZone?: string;
}

/**
 * 默认日期格式化选项
 */
const DEFAULT_DATE_FORMAT_OPTIONS: DateFormatOptions = {
  locale: "zh-CN",
  dateStyle: undefined,
  timeStyle: undefined,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: undefined,
  minute: undefined,
  second: undefined,
  hour12: false,
  timeZone: "Asia/Shanghai",
};

/**
 * 预定义日期格式模板
 */
export const DATE_FORMAT_TEMPLATES = {
  /**
   * 日期
   */
  DATE: {
    full: { dateStyle: "full" },
    long: { dateStyle: "long" },
    medium: { dateStyle: "medium" },
    short: { dateStyle: "short" },
  },

  /**
   * 时间
   */
  TIME: {
    full: { timeStyle: "full" },
    long: { timeStyle: "long" },
    medium: { timeStyle: "medium" },
    short: { timeStyle: "short" },
  },

  /**
   * 日期时间
   */
  DATETIME: {
    full: { dateStyle: "full", timeStyle: "long" },
    long: { dateStyle: "long", timeStyle: "medium" },
    medium: { dateStyle: "medium", timeStyle: "short" },
    short: { dateStyle: "short", timeStyle: "short" },
  },

  /**
   * 自定义常用格式
   */
  CUSTOM: {
    yearMonth: { year: "numeric", month: "long" },
    monthDay: { month: "long", day: "numeric" },
    weekday: { weekday: "long" },
    time: { hour: "2-digit", minute: "2-digit" },
    timeWithSeconds: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
  },
};

/**
 * 区域日期格式信息
 */
export interface LocaleDateFormat {
  /**
   * 日期顺序
   */
  order: "YMD" | "MDY" | "DMY";

  /**
   * 日期分隔符
   */
  separator: string;

  /**
   * 使用12小时制
   */
  hour12: boolean;
}

/**
 * 区域对应的日期格式信息
 */
export const LOCALE_DATE_FORMATS: Record<string, LocaleDateFormat> = {
  "zh-CN": { order: "YMD", separator: "-", hour12: false },
  "en-US": { order: "MDY", separator: "/", hour12: true },
  "en-GB": { order: "DMY", separator: "/", hour12: true },
  "ja-JP": { order: "YMD", separator: "/", hour12: false },
  "ko-KR": { order: "YMD", separator: ".", hour12: false },
};

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, options?: Partial<DateFormatOptions>): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const opts = { ...DEFAULT_DATE_FORMAT_OPTIONS, ...options };

  // 转换为 Intl.DateTimeFormat 选项
  const formatOptions: Intl.DateTimeFormatOptions = {};

  // 如果有指定日期风格或时间风格，则使用风格设置
  if (opts.dateStyle) {
    formatOptions.dateStyle = opts.dateStyle;
  }

  if (opts.timeStyle) {
    formatOptions.timeStyle = opts.timeStyle;
  }

  // 如果没有指定风格，则使用详细设置
  if (!opts.dateStyle && !opts.timeStyle) {
    if (opts.year) formatOptions.year = opts.year;
    if (opts.month) formatOptions.month = opts.month;
    if (opts.day) formatOptions.day = opts.day;
    if (opts.weekday) formatOptions.weekday = opts.weekday;
  }

  // 时间部分设置
  if (!opts.dateStyle && !opts.timeStyle) {
    if (opts.hour) formatOptions.hour = opts.hour;
    if (opts.minute) formatOptions.minute = opts.minute;
    if (opts.second) formatOptions.second = opts.second;
    if (opts.timeZoneName) formatOptions.timeZoneName = opts.timeZoneName;
  }

  // 通用设置
  if (opts.hour12 !== undefined) formatOptions.hour12 = opts.hour12;
  if (opts.timeZone) formatOptions.timeZone = opts.timeZone;

  try {
    const formatter = new Intl.DateTimeFormat(opts.locale, formatOptions);
    return formatter.format(dateObj);
  } catch (error) {
    console.error("日期格式化失败:", error);
    return dateObj.toLocaleString(opts.locale);
  }
}

/**
 * 按预定义模板格式化日期
 * @param date 日期对象或时间戳
 * @param templateName 模板名称 (如 'DATE.full', 'TIME.short' 等)
 * @param locale 区域
 * @returns 格式化后的日期字符串
 */
export function formatDateByTemplate(
  date: Date | number | string,
  templateName: string,
  locale: string = "zh-CN",
): string {
  const [category, style] = templateName.split(".");
  const templates = DATE_FORMAT_TEMPLATES as any;

  if (templates[category] && templates[category][style]) {
    return formatDate(date, {
      locale,
      ...templates[category][style],
    });
  }

  console.warn(`找不到预定义模板: ${templateName}`);
  return formatDate(date, { locale });
}

/**
 * 解析日期字符串
 * @param dateStr 日期字符串
 * @param locale 区域
 * @returns 解析后的日期对象
 */
export function parseDate(dateStr: string, locale: string = "zh-CN"): Date {
  if (!dateStr) return new Date(NaN);

  // 尝试直接解析
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // 获取区域的日期格式信息
  const formatInfo = LOCALE_DATE_FORMATS[locale] || LOCALE_DATE_FORMATS["zh-CN"];

  // 根据区域信息尝试解析
  const parts = dateStr.split(/[\/\-\.]/);

  // 如果有足够的部分，根据顺序组装日期
  if (parts.length >= 3) {
    let year, month, day;

    switch (formatInfo.order) {
      case "YMD":
        [year, month, day] = parts;
        break;
      case "MDY":
        [month, day, year] = parts;
        break;
      case "DMY":
        [day, month, year] = parts;
        break;
    }

    // 处理两位数年份
    if (year.length === 2) {
      year = "20" + year;
    }

    // 创建日期对象
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // 如果解析失败，返回无效日期
  return new Date(NaN);
}

/**
 * 格式化相对时间
 * @param date 日期对象或时间戳
 * @param baseDate 基准日期，默认为当前时间
 * @param locale 区域
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(
  date: Date | number | string,
  baseDate: Date | number | string = new Date(),
  locale: string = "zh-CN",
): string {
  const d1 = date instanceof Date ? date : new Date(date);
  const d2 = baseDate instanceof Date ? baseDate : new Date(baseDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return "";
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const diff = d1.getTime() - d2.getTime();
  const diffAbs = Math.abs(diff);
  const diffSign = Math.sign(diff);

  // 计算各时间单位
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // 根据差异大小选择合适的单位
  if (diffAbs < minute) {
    return rtf.format(Math.floor(diff / 1000), "second");
  } else if (diffAbs < hour) {
    return rtf.format(Math.floor(diff / minute) * diffSign, "minute");
  } else if (diffAbs < day) {
    return rtf.format(Math.floor(diff / hour) * diffSign, "hour");
  } else if (diffAbs < week) {
    return rtf.format(Math.floor(diff / day) * diffSign, "day");
  } else if (diffAbs < month) {
    return rtf.format(Math.floor(diff / week) * diffSign, "week");
  } else if (diffAbs < year) {
    return rtf.format(Math.floor(diff / month) * diffSign, "month");
  } else {
    return rtf.format(Math.floor(diff / year) * diffSign, "year");
  }
}

/**
 * 获取日期各部分
 * @param date 日期对象或时间戳
 * @param timeZone 时区
 * @returns 日期各部分值
 */
export function getDateParts(
  date: Date | number | string,
  timeZone?: string,
): {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
} {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (timeZone) {
    // 使用 Intl.DateTimeFormat 获取时区日期部分
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(dateObj).reduce(
      (acc, part) => {
        if (part.type !== "literal") {
          if (part.type === "weekday") {
            // 将星期名称转换为数字 (1-7 表示周一到周日)
            const weekdayMap: Record<string, number> = {
              Monday: 1,
              Tuesday: 2,
              Wednesday: 3,
              Thursday: 4,
              Friday: 5,
              Saturday: 6,
              Sunday: 7,
            };
            acc[part.type] = weekdayMap[part.value] || 0;
          } else {
            acc[part.type] = parseInt(part.value, 10) || 0;
          }
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      year: parts.year || dateObj.getFullYear(),
      month: parts.month || dateObj.getMonth() + 1,
      day: parts.day || dateObj.getDate(),
      weekday: parts.weekday || dateObj.getDay() || 7, // 1-7 表示周一到周日
      hour: parts.hour || dateObj.getHours(),
      minute: parts.minute || dateObj.getMinutes(),
      second: parts.second || dateObj.getSeconds(),
      millisecond: dateObj.getMilliseconds(),
    };
  }

  // 直接获取本地日期部分
  return {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth() + 1,
    day: dateObj.getDate(),
    weekday: dateObj.getDay() || 7, // 1-7 表示周一到周日
    hour: dateObj.getHours(),
    minute: dateObj.getMinutes(),
    second: dateObj.getSeconds(),
    millisecond: dateObj.getMilliseconds(),
  };
}

/**
 * 获取特定区域的日期名称
 * @param locale 区域
 * @returns 日期名称对象
 */
export function getLocaleDateNames(locale: string = "zh-CN"): {
  months: string[];
  shortMonths: string[];
  days: string[];
  shortDays: string[];
} {
  const months = [];
  const shortMonths = [];
  const days = [];
  const shortDays = [];

  // 获取月份名称
  for (let i = 0; i < 12; i++) {
    const date = new Date(2000, i, 1);
    months.push(date.toLocaleString(locale, { month: "long" }));
    shortMonths.push(date.toLocaleString(locale, { month: "short" }));
  }

  // 获取星期名称
  for (let i = 1; i <= 7; i++) {
    const date = new Date(2000, 0, i);
    days.push(date.toLocaleString(locale, { weekday: "long" }));
    shortDays.push(date.toLocaleString(locale, { weekday: "short" }));
  }

  return { months, shortMonths, days, shortDays };
}

/**
 * 判断是否是同一天
 * @param date1 日期1
 * @param date2 日期2
 * @param timeZone 时区
 * @returns 是否是同一天
 */
export function isSameDay(date1: Date | number | string, date2: Date | number | string, timeZone?: string): boolean {
  const parts1 = getDateParts(date1, timeZone);
  const parts2 = getDateParts(date2, timeZone);

  return parts1.year === parts2.year && parts1.month === parts2.month && parts1.day === parts2.day;
}

/**
 * 简单的日期格式化（不依赖 Intl 对象）
 * @param date 日期对象或时间戳
 * @param format 格式模板
 * @returns 格式化后的日期字符串
 */
export function simpleDateFormat(date: Date | number | string, format: string = "YYYY-MM-DD"): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  const milliseconds = dateObj.getMilliseconds();

  // 12小时制
  const hours12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";

  // 格式化各部分
  const formatted = format
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

  return formatted;
}

// 同时提供命名空间对象
export const date = {
  formatDate,
  formatDateByTemplate,
  parseDate,
  formatRelativeTime,
  getDateParts,
  getLocaleDateNames,
  isSameDay,
  simpleDateFormat,
  DEFAULT_DATE_FORMAT_OPTIONS,
  DATE_FORMAT_TEMPLATES,
  LOCALE_DATE_FORMATS,
};

// 默认导出命名空间对象
export default date;
