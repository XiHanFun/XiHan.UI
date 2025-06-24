// 抽屉组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface DrawerLocale {
  close: string;
  confirm: string;
  cancel: string;
  loading: string;
  expand: string;
  collapse: string;
}

export const DrawerLocale: Record<string, DeepPartial<DrawerLocale>> = {
  "zh-CN": {
    close: "关闭",
    confirm: "确定",
    cancel: "取消",
    loading: "加载中",
    expand: "展开",
    collapse: "收起",
  },
  "en-US": {
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    loading: "Loading",
    expand: "Expand",
    collapse: "Collapse",
  },
};
