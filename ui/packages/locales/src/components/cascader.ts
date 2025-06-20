// 级联选择器组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface CascaderLocale {
  placeholder: string;
  searchPlaceholder: string;
  loading: string;
  noData: string;
  noResult: string;
  filterConfirm: string;
  filterReset: string;
  selectAll: string;
  selectNone: string;
  selectInvert: string;
  selectCurrent: string;
  selectAllItems: string;
  selectNoneItems: string;
  selectInvertItems: string;
  selectCurrentItems: string;
}

export const CascaderLocale: Record<string, DeepPartial<CascaderLocale>> = {
  "zh-CN": {
    placeholder: "请选择",
    searchPlaceholder: "搜索",
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    filterConfirm: "确定",
    filterReset: "重置",
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
    placeholder: "Please select",
    searchPlaceholder: "Search",
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    filterConfirm: "OK",
    filterReset: "Reset",
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
