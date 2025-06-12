// 栅格行组件国际化
import type { DeepPartial } from "../types";

export interface RowLocale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export const RowLocale: Record<string, DeepPartial<RowLocale>> = {
  "zh-CN": {
    xs: "超小屏幕",
    sm: "小屏幕",
    md: "中等屏幕",
    lg: "大屏幕",
    xl: "超大屏幕",
    xxl: "巨大屏幕",
  },
  "en-US": {
    xs: "Extra Small",
    sm: "Small",
    md: "Medium",
    lg: "Large",
    xl: "Extra Large",
    xxl: "Extra Extra Large",
  },
};
