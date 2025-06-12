// 漫游式引导组件国际化
import type { DeepPartial } from "../types";

export interface TourLocale {
  loading: string;
  noData: string;
  noResult: string;
  next: string;
  prev: string;
  finish: string;
  skip: string;
}

export const TourLocale: Record<string, DeepPartial<TourLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    next: "下一步",
    prev: "上一步",
    finish: "完成",
    skip: "跳过",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    next: "Next",
    prev: "Previous",
    finish: "Finish",
    skip: "Skip",
  },
};
