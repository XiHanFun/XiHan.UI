// 输入框组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface InputLocale {
  placeholder: string;
  clear: string;
  search: string;
  loading: string;
  maxLength: string;
}

export const InputLocale: Record<string, DeepPartial<InputLocale>> = {
  "zh-CN": {
    placeholder: "请输入",
    clear: "清除",
    search: "搜索",
    loading: "加载中",
    maxLength: "最大长度",
  },
  "en-US": {
    placeholder: "Please input",
    clear: "Clear",
    search: "Search",
    loading: "Loading",
    maxLength: "Max length",
  },
};
