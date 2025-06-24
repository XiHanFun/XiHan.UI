// 表格组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface TableLocale {
  filterTitle: string;
  filterConfirm: string;
  filterReset: string;
  filterEmptyText: string;
  selectAll: string;
  selectInvert: string;
  selectionAll: string;
  sortTitle: string;
  expand: string;
  collapse: string;
  triggerDesc: string;
  triggerAsc: string;
  cancelSort: string;
}

export const TableLocale: Record<string, DeepPartial<TableLocale>> = {
  "zh-CN": {
    filterTitle: "筛选",
    filterConfirm: "确定",
    filterReset: "重置",
    filterEmptyText: "无筛选项",
    selectAll: "全选当页",
    selectInvert: "反选当页",
    selectionAll: "全选所有",
    sortTitle: "排序",
    expand: "展开行",
    collapse: "关闭行",
    triggerDesc: "点击降序",
    triggerAsc: "点击升序",
    cancelSort: "取消排序",
  },
  "en-US": {
    filterTitle: "Filter",
    filterConfirm: "OK",
    filterReset: "Reset",
    filterEmptyText: "No filters",
    selectAll: "Select all on page",
    selectInvert: "Invert selection on page",
    selectionAll: "Select all",
    sortTitle: "Sort",
    expand: "Expand row",
    collapse: "Collapse row",
    triggerDesc: "Click to sort descending",
    triggerAsc: "Click to sort ascending",
    cancelSort: "Click to cancel sorting",
  },
};
