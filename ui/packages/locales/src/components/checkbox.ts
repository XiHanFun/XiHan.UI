// 复选框组件国际化
import type { DeepPartial } from "../types";

export interface CheckboxLocale {
  selectAll: string;
  selectNone: string;
  selectInvert: string;
  selectCurrent: string;
  selectAllItems: string;
  selectNoneItems: string;
  selectInvertItems: string;
  selectCurrentItems: string;
}

export const CheckboxLocale: Record<string, DeepPartial<CheckboxLocale>> = {
  "zh-CN": {
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
