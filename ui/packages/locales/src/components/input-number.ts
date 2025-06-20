// 数字输入框组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface InputNumberLocale {
  placeholder: string;
  max: string;
  min: string;
  step: string;
  precision: string;
  loading: string;
}

export const InputNumberLocale: Record<string, DeepPartial<InputNumberLocale>> = {
  "zh-CN": {
    placeholder: "请输入数字",
    max: "最大值",
    min: "最小值",
    step: "步长",
    precision: "精度",
    loading: "加载中",
  },
  "en-US": {
    placeholder: "Please input number",
    max: "Maximum",
    min: "Minimum",
    step: "Step",
    precision: "Precision",
    loading: "Loading",
  },
};
