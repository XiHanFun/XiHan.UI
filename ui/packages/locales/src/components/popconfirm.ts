// 气泡确认框组件国际化
import type { DeepPartial } from "../types";

export interface PopconfirmLocale {
  okText: string;
  cancelText: string;
  title: string;
  description: string;
}

export const PopconfirmLocale: Record<string, DeepPartial<PopconfirmLocale>> = {
  "zh-CN": {
    okText: "确定",
    cancelText: "取消",
    title: "确认",
    description: "确定要执行此操作吗？",
  },
  "en-US": {
    okText: "OK",
    cancelText: "Cancel",
    title: "Confirm",
    description: "Are you sure you want to perform this action?",
  },
};
