// 下拉菜单组件国际化
import type { DeepPartial } from "../types";

export interface DropdownLocale {
  loading: string;
  noData: string;
  noResult: string;
  filterConfirm: string;
  filterReset: string;
}

export const DropdownLocale: Record<string, DeepPartial<DropdownLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    filterConfirm: "确定",
    filterReset: "重置",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    filterConfirm: "OK",
    filterReset: "Reset",
  },
};
