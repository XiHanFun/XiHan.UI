// 标签组件国际化
import type { DeepPartial } from "../types";

export interface TagLocale {
  loading: string;
  noData: string;
  noResult: string;
  close: string;
  checkable: string;
}

export const TagLocale: Record<string, DeepPartial<TagLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    close: "关闭",
    checkable: "可选中",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    close: "Close",
    checkable: "Checkable",
  },
};
