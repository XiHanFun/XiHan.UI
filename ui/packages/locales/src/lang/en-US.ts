// 英文语言包
import { ButtonLocale } from "../components/button";
import { ModalLocale } from "../components/modal";
import { PaginationLocale } from "../components/pagination";
import { AlertLocale } from "../components/alert";
import { AffixLocale } from "../components/affix";
import { FormLocale } from "../components/form";

// 全局通用文案
const global = {
  placeholder: "Please select",
  search: "Search",
  searchPlaceholder: "Enter keyword",
  loading: "Loading",
  noData: "No data",
  noResult: "No results",
  filterConfirm: "OK",
  filterReset: "Reset",
  moreText: "More",
  lessText: "Less",
  selectAll: "Select all",
  selectInvert: "Invert selection",
  selectNone: "Clear all",
  expand: "Expand",
  collapse: "Collapse",
  save: "Save",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  confirm: "Confirm",
  done: "Done",
  add: "Add",
  remove: "Remove",
  close: "Close",
  prev: "Previous",
  next: "Next",
  complete: "Complete",
  day: "Day",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
};

/**
 * 英文语言包
 */
export const enUS = {
  locale: "en-US",
  name: "English",
  global,
  // 引入组件国际化文案
  button: ButtonLocale["en-US"],
  modal: ModalLocale["en-US"],
  pagination: PaginationLocale["en-US"],
  alert: AlertLocale["en-US"],
  affix: AffixLocale["en-US"],
  form: FormLocale["en-US"],
};
