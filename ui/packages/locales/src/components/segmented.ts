// 分段控制器组件国际化
import type { DeepPartial } from "../types";

export interface SegmentedLocale {
  loading: string;
  noData: string;
  noResult: string;
}

export const SegmentedLocale: Record<string, DeepPartial<SegmentedLocale>> = {
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
