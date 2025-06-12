// 气泡卡片组件国际化
import type { DeepPartial } from "../types";

export interface PopoverLocale {
  close: string;
  loading: string;
  noData: string;
  noResult: string;
}

export const PopoverLocale: Record<string, DeepPartial<PopoverLocale>> = {
  "zh-CN": {
    close: "关闭",
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
  },
  "en-US": {
    close: "Close",
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
  },
};
