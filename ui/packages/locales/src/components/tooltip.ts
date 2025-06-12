// 文字提示组件国际化
import type { DeepPartial } from "../types";

export interface TooltipLocale {
  loading: string;
  noData: string;
  noResult: string;
}

export const TooltipLocale: Record<string, DeepPartial<TooltipLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
  },
};
