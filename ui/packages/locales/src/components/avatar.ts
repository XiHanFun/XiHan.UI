// 头像组件国际化
import type { DeepPartial } from "../types";

export interface AvatarLocale {
  alt: string;
}

export const AvatarLocale: Record<string, DeepPartial<AvatarLocale>> = {
  "zh-CN": {
    alt: "头像",
  },
  "en-US": {
    alt: "Avatar",
  },
};
