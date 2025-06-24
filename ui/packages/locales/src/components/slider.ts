// 滑动输入条组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface SliderLocale {
  loading: string;
  noData: string;
  noResult: string;
  min: string;
  max: string;
  step: string;
}

export const SliderLocale: Record<string, DeepPartial<SliderLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    min: "最小值",
    max: "最大值",
    step: "步长",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    min: "Minimum",
    max: "Maximum",
    step: "Step",
  },
};
