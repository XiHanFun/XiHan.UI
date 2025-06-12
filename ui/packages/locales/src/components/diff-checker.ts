// 差异检查器组件国际化
import type { DeepPartial } from "../types";

export interface DiffCheckerLocale {
  original: string;
  modified: string;
  diff: string;
  loading: string;
  noDiff: string;
  error: string;
}

export const DiffCheckerLocale: Record<string, DeepPartial<DiffCheckerLocale>> = {
  "zh-CN": {
    original: "原始内容",
    modified: "修改内容",
    diff: "差异对比",
    loading: "加载中",
    noDiff: "无差异",
    error: "加载失败",
  },
  "en-US": {
    original: "Original",
    modified: "Modified",
    diff: "Diff",
    loading: "Loading",
    noDiff: "No differences",
    error: "Failed to load",
  },
};
