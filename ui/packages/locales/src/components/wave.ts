// 波纹组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface WaveLocale {
  loading: string;
  noData: string;
  noResult: string;
  color: string;
  duration: string;
  size: string;
}

export const WaveLocale: Record<string, DeepPartial<WaveLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    color: "颜色",
    duration: "持续时间",
    size: "大小",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    color: "Color",
    duration: "Duration",
    size: "Size",
  },
};
