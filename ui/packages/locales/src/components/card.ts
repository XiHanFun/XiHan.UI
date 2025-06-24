// 卡片组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface CardLocale {
  actions: string;
  loading: string;
  expand: string;
  collapse: string;
}

export const CardLocale: Record<string, DeepPartial<CardLocale>> = {
  "zh-CN": {
    actions: "操作",
    loading: "加载中",
    expand: "展开",
    collapse: "收起",
  },
  "en-US": {
    actions: "Actions",
    loading: "Loading",
    expand: "Expand",
    collapse: "Collapse",
  },
};
