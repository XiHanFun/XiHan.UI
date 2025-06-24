// 开关组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface SwitchLocale {
  loading: string;
  noData: string;
  noResult: string;
  checked: string;
  unchecked: string;
}

export const SwitchLocale: Record<string, DeepPartial<SwitchLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    checked: "已选中",
    unchecked: "未选中",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    checked: "Checked",
    unchecked: "Unchecked",
  },
};
