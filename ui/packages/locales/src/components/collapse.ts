// 折叠面板组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface CollapseLocale {
  expand: string;
  collapse: string;
  loading: string;
}

export const CollapseLocale: Record<string, DeepPartial<CollapseLocale>> = {
  "zh-CN": {
    expand: "展开",
    collapse: "收起",
    loading: "加载中",
  },
  "en-US": {
    expand: "Expand",
    collapse: "Collapse",
    loading: "Loading",
  },
};
