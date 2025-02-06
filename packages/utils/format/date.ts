// 日期处理相关

type DateValue = Date | string | number;

/**
 * 日期格式化工具
 */
export const dateUtils = {
  /**
   * 格式化日期
   */
  format(date: DateValue, format = "YYYY-MM-DD HH:mm:ss"): string {
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
  },

  /**
   * 相对时间
   */
  relative(date: DateValue): string {
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
  },

  /**
   * 是否为同一天
   */
  isSameDay(date1: DateValue, date2: DateValue): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  },

  /**
   * 获取日期范围
   */
  getRange(date: DateValue, unit: "year" | "month" | "week" | "day"): [Date, Date] {
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
  },
};
