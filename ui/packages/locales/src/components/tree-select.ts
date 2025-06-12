// 树选择组件国际化
import type { DeepPartial } from "../types";

export interface TreeSelectLocale {
  loading: string;
  noData: string;
  noResult: string;
  searchPlaceholder: string;
  placeholder: string;
  selectAll: string;
  selectNone: string;
  selectInvert: string;
  selectCurrent: string;
  selectAllItems: string;
  selectNoneItems: string;
  selectInvertItems: string;
  selectCurrentItems: string;
}

export const TreeSelectLocale: Record<string, DeepPartial<TreeSelectLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    searchPlaceholder: "请输入搜索内容",
    placeholder: "请选择",
    selectAll: "全选",
    selectNone: "取消全选",
    selectInvert: "反选",
    selectCurrent: "当前页",
    selectAllItems: "全选所有项",
    selectNoneItems: "取消全选所有项",
    selectInvertItems: "反选所有项",
    selectCurrentItems: "全选当前页",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    searchPlaceholder: "Please enter search content",
    placeholder: "Please select",
    selectAll: "Select all",
    selectNone: "Deselect all",
    selectInvert: "Invert selection",
    selectCurrent: "Current page",
    selectAllItems: "Select all items",
    selectNoneItems: "Deselect all items",
    selectInvertItems: "Invert all items",
    selectCurrentItems: "Select current page",
  },
};
