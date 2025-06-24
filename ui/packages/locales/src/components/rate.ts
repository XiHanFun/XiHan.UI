// 评分组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface RateLocale {
  loading: string;
  noData: string;
  noResult: string;
  star: string;
  stars: string;
}

export const RateLocale: Record<string, DeepPartial<RateLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    star: "星",
    stars: "星",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    star: "star",
    stars: "stars",
  },
};
