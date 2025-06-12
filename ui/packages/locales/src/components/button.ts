// 按钮组件国际化
import type { DeepPartial } from "../types";

export interface ButtonLocale {
  confirm: string;
  cancel: string;
  submit: string;
  reset: string;
  ok: string;
  yes: string;
  no: string;
  back: string;
  next: string;
  loading: string;
}

export const ButtonLocale: Record<string, DeepPartial<ButtonLocale>> = {
  "zh-CN": {
    confirm: "确认",
    cancel: "取消",
    submit: "提交",
    reset: "重置",
    ok: "确定",
    yes: "是",
    no: "否",
    back: "返回",
    next: "下一步",
    loading: "加载中",
  },
  "en-US": {
    confirm: "Confirm",
    cancel: "Cancel",
    submit: "Submit",
    reset: "Reset",
    ok: "OK",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    loading: "Loading",
  },
};
