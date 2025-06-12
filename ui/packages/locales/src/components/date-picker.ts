// 日期选择器组件国际化
import type { DeepPartial } from "../types";

export interface DatePickerLocale {
  placeholder: string;
  rangePlaceholder: [string, string];
  today: string;
  now: string;
  backToToday: string;
  ok: string;
  clear: string;
  month: string;
  year: string;
  timeSelect: string;
  dateSelect: string;
  weekSelect: string;
  monthSelect: string;
  yearSelect: string;
  decadeSelect: string;
  yearFormat: string;
  monthFormat: string;
  dateFormat: string;
  dayFormat: string;
  dateTimeFormat: string;
  monthBeforeYear: boolean;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  previousDecade: string;
  nextDecade: string;
  previousCentury: string;
  nextCentury: string;
}

export const DatePickerLocale: Record<string, DeepPartial<DatePickerLocale>> = {
  "zh-CN": {
    placeholder: "请选择日期",
    rangePlaceholder: ["开始日期", "结束日期"],
    today: "今天",
    now: "此刻",
    backToToday: "返回今天",
    ok: "确定",
    clear: "清除",
    month: "月",
    year: "年",
    timeSelect: "选择时间",
    dateSelect: "选择日期",
    weekSelect: "选择周",
    monthSelect: "选择月份",
    yearSelect: "选择年份",
    decadeSelect: "选择年代",
    yearFormat: "YYYY年",
    monthFormat: "M月",
    dateFormat: "YYYY年M月D日",
    dayFormat: "D日",
    dateTimeFormat: "YYYY年M月D日 HH时mm分ss秒",
    monthBeforeYear: true,
    previousMonth: "上个月 (PageUp)",
    nextMonth: "下个月 (PageDown)",
    previousYear: "上一年 (Control + left)",
    nextYear: "下一年 (Control + right)",
    previousDecade: "上一年代",
    nextDecade: "下一年代",
    previousCentury: "上一世纪",
    nextCentury: "下一世纪",
  },
  "en-US": {
    placeholder: "Select date",
    rangePlaceholder: ["Start date", "End date"],
    today: "Today",
    now: "Now",
    backToToday: "Back to today",
    ok: "Ok",
    clear: "Clear",
    month: "Month",
    year: "Year",
    timeSelect: "Select time",
    dateSelect: "Select date",
    weekSelect: "Select week",
    monthSelect: "Select month",
    yearSelect: "Select year",
    decadeSelect: "Select decade",
    yearFormat: "YYYY",
    monthFormat: "MMMM",
    dateFormat: "MMMM D, YYYY",
    dayFormat: "D",
    dateTimeFormat: "MMMM D, YYYY HH:mm:ss",
    monthBeforeYear: false,
    previousMonth: "Previous month (PageUp)",
    nextMonth: "Next month (PageDown)",
    previousYear: "Previous year (Control + left)",
    nextYear: "Next year (Control + right)",
    previousDecade: "Previous decade",
    nextDecade: "Next decade",
    previousCentury: "Previous century",
    nextCentury: "Next century",
  },
};
