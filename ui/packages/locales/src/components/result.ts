// 结果组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface ResultLocale {
  success: string;
  error: string;
  info: string;
  warning: string;
  loading: string;
  back: string;
  retry: string;
  home: string;
}

export const ResultLocale: Record<string, DeepPartial<ResultLocale>> = {
  "zh-CN": {
    success: "成功",
    error: "错误",
    info: "提示",
    warning: "警告",
    loading: "加载中",
    back: "返回",
    retry: "重试",
    home: "首页",
  },
  "en-US": {
    success: "Success",
    error: "Error",
    info: "Info",
    warning: "Warning",
    loading: "Loading",
    back: "Back",
    retry: "Retry",
    home: "Home",
  },
};
