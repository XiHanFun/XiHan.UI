// 图标组件国际化
import type { DeepPartial } from "../types";

export interface IconLocale {
  loading: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const IconLocale: Record<string, DeepPartial<IconLocale>> = {
  "zh-CN": {
    loading: "加载中",
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  },
  "en-US": {
    loading: "Loading",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  },
};
