// 固钉组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface AffixLocale {
  topText: string;
  bottomText: string;
}

export const AffixLocale: Record<string, DeepPartial<AffixLocale>> = {
  "zh-CN": {
    topText: "固定在顶部",
    bottomText: "固定在底部",
  },
  "en-US": {
    topText: "Fixed at top",
    bottomText: "Fixed at bottom",
  },
};
