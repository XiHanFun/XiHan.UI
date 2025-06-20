// 锚点组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface AnchorLocale {
  copy: string;
  copySuccess: string;
  copyError: string;
}

export const AnchorLocale: Record<string, DeepPartial<AnchorLocale>> = {
  "zh-CN": {
    copy: "复制链接",
    copySuccess: "复制成功",
    copyError: "复制失败",
  },
  "en-US": {
    copy: "Copy Link",
    copySuccess: "Copy Success",
    copyError: "Copy Failed",
  },
};
