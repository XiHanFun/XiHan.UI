// 步骤条组件国际化
import type { DeepPartial } from "../types";

export interface StepsLocale {
  loading: string;
  noData: string;
  noResult: string;
  next: string;
  prev: string;
  finish: string;
  error: string;
  wait: string;
  process: string;
  completed: string;
}

export const StepsLocale: Record<string, DeepPartial<StepsLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    next: "下一步",
    prev: "上一步",
    finish: "完成",
    error: "错误",
    wait: "等待",
    process: "进行中",
    completed: "已完成",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    next: "Next",
    prev: "Previous",
    finish: "Finish",
    error: "Error",
    wait: "Wait",
    process: "Process",
    completed: "Completed",
  },
};
