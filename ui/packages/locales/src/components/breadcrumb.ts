// 面包屑组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface BreadcrumbLocale {
  expandText: string;
}

export const BreadcrumbLocale: Record<string, DeepPartial<BreadcrumbLocale>> = {
  "zh-CN": {
    expandText: "展开",
  },
  "en-US": {
    expandText: "Expand",
  },
};
