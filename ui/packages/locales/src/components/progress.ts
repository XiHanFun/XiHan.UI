// 进度条组件国际化
import type { DeepPartial } from "../types";

export interface ProgressLocale {
  success: string;
  error: string;
  normal: string;
  percent: string;
}

export const ProgressLocale: Record<string, DeepPartial<ProgressLocale>> = {
  "zh-CN": {
    success: "成功",
    error: "错误",
    normal: "正常",
    percent: "百分比",
  },
  "en-US": {
    success: "Success",
    error: "Error",
    normal: "Normal",
    percent: "Percent",
  },
};
