// 中文语言包
import { ButtonLocale } from "../components/button";
import { ModalLocale } from "../components/modal";
import { PaginationLocale } from "../components/pagination";
import { AlertLocale } from "../components/alert";
import { AffixLocale } from "../components/affix";
import { FormLocale } from "../components/form";

// 全局通用文案
const global = {
  placeholder: "请选择",
  search: "搜索",
  searchPlaceholder: "请输入关键字",
  loading: "加载中",
  noData: "暂无数据",
  noResult: "无匹配结果",
  filterConfirm: "确定",
  filterReset: "重置",
  moreText: "更多",
  lessText: "收起",
  selectAll: "全选",
  selectInvert: "反选",
  selectNone: "清空",
  expand: "展开",
  collapse: "收起",
  save: "保存",
  edit: "编辑",
  delete: "删除",
  cancel: "取消",
  confirm: "确认",
  done: "完成",
  add: "添加",
  remove: "移除",
  close: "关闭",
  prev: "上一步",
  next: "下一步",
  complete: "完成",
  day: "天",
  hour: "小时",
  minute: "分钟",
  second: "秒",
};

/**
 * 中文语言包
 */
export const zhCN = {
  locale: "zh-CN",
  name: "简体中文",
  global,
  // 引入组件国际化文案
  button: ButtonLocale["zh-CN"],
  modal: ModalLocale["zh-CN"],
  pagination: PaginationLocale["zh-CN"],
  alert: AlertLocale["zh-CN"],
  affix: AffixLocale["zh-CN"],
  form: FormLocale["zh-CN"],
};
