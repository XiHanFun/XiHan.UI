// 分割线组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface DividerLocale {
  horizontal: string;
  vertical: string;
  dashed: string;
  plain: string;
}

export const DividerLocale: Record<string, DeepPartial<DividerLocale>> = {
  "zh-CN": {
    horizontal: "水平分割线",
    vertical: "垂直分割线",
    dashed: "虚线",
    plain: "无文字",
  },
  "en-US": {
    horizontal: "Horizontal Divider",
    vertical: "Vertical Divider",
    dashed: "Dashed",
    plain: "Plain",
  },
};
