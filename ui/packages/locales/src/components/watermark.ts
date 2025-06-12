// 水印组件国际化
import type { DeepPartial } from "../types";

export interface WatermarkLocale {
  loading: string;
  noData: string;
  noResult: string;
  text: string;
  image: string;
  opacity: string;
  rotate: string;
  scale: string;
  gap: string;
  offset: string;
}

export const WatermarkLocale: Record<string, DeepPartial<WatermarkLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    text: "水印文字",
    image: "水印图片",
    opacity: "透明度",
    rotate: "旋转角度",
    scale: "缩放比例",
    gap: "间距",
    offset: "偏移量",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    text: "Watermark text",
    image: "Watermark image",
    opacity: "Opacity",
    rotate: "Rotation angle",
    scale: "Scale",
    gap: "Gap",
    offset: "Offset",
  },
};
