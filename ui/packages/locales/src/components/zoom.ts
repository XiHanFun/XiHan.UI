// 缩放组件国际化
import type { DeepPartial } from "../types";

export interface ZoomLocale {
  loading: string;
  noData: string;
  noResult: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  rotate: string;
  fullscreen: string;
  exitFullscreen: string;
}

export const ZoomLocale: Record<string, DeepPartial<ZoomLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    zoomIn: "放大",
    zoomOut: "缩小",
    reset: "重置",
    rotate: "旋转",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset",
    rotate: "Rotate",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
  },
};
