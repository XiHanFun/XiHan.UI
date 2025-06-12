// 时间选择器组件国际化
import type { DeepPartial } from "../types";

export interface TimePickerLocale {
  placeholder: string;
  rangePlaceholder: [string, string];
  now: string;
  ok: string;
  clear: string;
  hour: string;
  minute: string;
  second: string;
  am: string;
  pm: string;
}

export const TimePickerLocale: Record<string, DeepPartial<TimePickerLocale>> = {
  "zh-CN": {
    placeholder: "请选择时间",
    rangePlaceholder: ["开始时间", "结束时间"],
    now: "此刻",
    ok: "确定",
    clear: "清除",
    hour: "时",
    minute: "分",
    second: "秒",
    am: "上午",
    pm: "下午",
  },
  "en-US": {
    placeholder: "Select time",
    rangePlaceholder: ["Start time", "End time"],
    now: "Now",
    ok: "OK",
    clear: "Clear",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    am: "AM",
    pm: "PM",
  },
};
