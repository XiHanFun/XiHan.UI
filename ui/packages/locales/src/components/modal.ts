// 对话框组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface ModalLocale {
  okText: string;
  cancelText: string;
  justOkText: string;
  close: string;
  confirm: string;
  info: string;
  success: string;
  error: string;
  warning: string;
}

export const ModalLocale: Record<string, DeepPartial<ModalLocale>> = {
  "zh-CN": {
    okText: "确定",
    cancelText: "取消",
    justOkText: "知道了",
    close: "关闭",
    confirm: "确认",
    info: "提示",
    success: "成功",
    error: "错误",
    warning: "警告",
  },
  "en-US": {
    okText: "OK",
    cancelText: "Cancel",
    justOkText: "Got it",
    close: "Close",
    confirm: "Confirm",
    info: "Information",
    success: "Success",
    error: "Error",
    warning: "Warning",
  },
};
