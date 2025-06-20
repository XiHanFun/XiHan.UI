// 警告组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface AlertLocale {
  close: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const AlertLocale: Record<string, DeepPartial<AlertLocale>> = {
  "zh-CN": {
    close: "关闭",
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  },
  "en-US": {
    close: "Close",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  },
};
