// 间距组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface SpaceLocale {
  small: string;
  middle: string;
  large: string;
}

export const SpaceLocale: Record<string, DeepPartial<SpaceLocale>> = {
  "zh-CN": {
    small: "小",
    middle: "中",
    large: "大",
  },
  "en-US": {
    small: "Small",
    middle: "Middle",
    large: "Large",
  },
};
