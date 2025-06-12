// 通知组件国际化
import type { DeepPartial } from "../types";

export interface NotificationLocale {
  close: string;
  closeAll: string;
  loading: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const NotificationLocale: Record<string, DeepPartial<NotificationLocale>> = {
  "zh-CN": {
    close: "关闭",
    closeAll: "关闭所有",
    loading: "加载中",
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  },
  "en-US": {
    close: "Close",
    closeAll: "Close all",
    loading: "Loading",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  },
};
