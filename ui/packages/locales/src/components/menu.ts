// 菜单组件国际化
import type { DeepPartial } from "../types";

export interface MenuLocale {
  expand: string;
  collapse: string;
  loading: string;
  noData: string;
  noResult: string;
}

export const MenuLocale: Record<string, DeepPartial<MenuLocale>> = {
  "zh-CN": {
    expand: "展开",
    collapse: "收起",
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
  },
  "en-US": {
    expand: "Expand",
    collapse: "Collapse",
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
  },
};
