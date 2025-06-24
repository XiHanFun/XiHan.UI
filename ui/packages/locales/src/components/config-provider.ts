// 全局配置组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface ConfigProviderLocale {
  locale: string;
  theme: string;
  size: string;
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export const ConfigProviderLocale: Record<string, DeepPartial<ConfigProviderLocale>> = {
  "zh-CN": {
    locale: "语言",
    theme: "主题",
    size: "尺寸",
    loading: "加载中",
    error: "错误",
    success: "成功",
    warning: "警告",
    info: "提示",
  },
  "en-US": {
    locale: "Language",
    theme: "Theme",
    size: "Size",
    loading: "Loading",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
  },
};
