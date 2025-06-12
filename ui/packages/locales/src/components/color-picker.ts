// 颜色选择器组件国际化
import type { DeepPartial } from "../types";

export interface ColorPickerLocale {
  clear: string;
  confirm: string;
  preset: string;
  custom: string;
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  alpha: string;
  format: string;
  history: string;
  recent: string;
  noColor: string;
}

export const ColorPickerLocale: Record<string, DeepPartial<ColorPickerLocale>> = {
  "zh-CN": {
    clear: "清除",
    confirm: "确定",
    preset: "预设",
    custom: "自定义",
    hex: "十六进制",
    rgb: "RGB",
    hsl: "HSL",
    hsv: "HSV",
    alpha: "透明度",
    format: "格式",
    history: "历史记录",
    recent: "最近使用",
    noColor: "无颜色",
  },
  "en-US": {
    clear: "Clear",
    confirm: "Confirm",
    preset: "Preset",
    custom: "Custom",
    hex: "Hex",
    rgb: "RGB",
    hsl: "HSL",
    hsv: "HSV",
    alpha: "Alpha",
    format: "Format",
    history: "History",
    recent: "Recent",
    noColor: "No color",
  },
};
