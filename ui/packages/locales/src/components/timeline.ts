// 时间线组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface TimelineLocale {
  loading: string;
  noData: string;
  noResult: string;
  pending: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const TimelineLocale: Record<string, DeepPartial<TimelineLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    pending: "等待中",
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    pending: "Pending",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  },
};
