// 描述列表组件国际化
import type { DeepPartial } from "../types";

export interface DescriptionsLocale {
  expand: string;
  collapse: string;
  loading: string;
  empty: string;
}

export const DescriptionsLocale: Record<string, DeepPartial<DescriptionsLocale>> = {
  "zh-CN": {
    expand: "展开",
    collapse: "收起",
    loading: "加载中",
    empty: "暂无数据",
  },
  "en-US": {
    expand: "Expand",
    collapse: "Collapse",
    loading: "Loading",
    empty: "No data",
  },
};
