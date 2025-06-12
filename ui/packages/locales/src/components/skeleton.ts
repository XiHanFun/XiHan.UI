// 骨架屏组件国际化
import type { DeepPartial } from "../types";

export interface SkeletonLocale {
  loading: string;
  active: string;
  inactive: string;
}

export const SkeletonLocale: Record<string, DeepPartial<SkeletonLocale>> = {
  "zh-CN": {
    loading: "加载中",
    active: "活跃",
    inactive: "非活跃",
  },
  "en-US": {
    loading: "Loading",
    active: "Active",
    inactive: "Inactive",
  },
};
