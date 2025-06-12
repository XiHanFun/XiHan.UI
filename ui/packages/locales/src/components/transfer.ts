// 穿梭框组件国际化
import type { DeepPartial } from "../types";

export interface TransferLocale {
  loading: string;
  noData: string;
  noResult: string;
  searchPlaceholder: string;
  titles: [string, string];
  notFoundContent: string;
  itemUnit: string;
  itemsUnit: string;
  remove: string;
  selectAll: string;
  selectCurrent: string;
  selectInvert: string;
  removeAll: string;
  removeCurrent: string;
}

export const TransferLocale: Record<string, DeepPartial<TransferLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    searchPlaceholder: "请输入搜索内容",
    titles: ["源列表", "目标列表"],
    notFoundContent: "无匹配结果",
    itemUnit: "项",
    itemsUnit: "项",
    remove: "删除",
    selectAll: "全选",
    selectCurrent: "全选当前页",
    selectInvert: "反选当前页",
    removeAll: "删除全部",
    removeCurrent: "删除当前页",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    searchPlaceholder: "Please enter search content",
    titles: ["Source List", "Target List"],
    notFoundContent: "No matching results",
    itemUnit: "item",
    itemsUnit: "items",
    remove: "Remove",
    selectAll: "Select All",
    selectCurrent: "Select Current Page",
    selectInvert: "Invert Current Page",
    removeAll: "Remove All",
    removeCurrent: "Remove Current Page",
  },
};
