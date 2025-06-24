// 回到顶部组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface BackTopLocale {
  title: string;
}

export const BackTopLocale: Record<string, DeepPartial<BackTopLocale>> = {
  "zh-CN": {
    title: "回到顶部",
  },
  "en-US": {
    title: "Back to top",
  },
};
