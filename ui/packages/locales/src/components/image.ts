// 图片组件国际化
import type { DeepPartial } from "../types";

export interface ImageLocale {
  preview: string;
  loading: string;
  error: string;
  zoomIn: string;
  zoomOut: string;
  rotate: string;
  download: string;
  fullscreen: string;
  exitFullscreen: string;
}

export const ImageLocale: Record<string, DeepPartial<ImageLocale>> = {
  "zh-CN": {
    preview: "预览",
    loading: "加载中",
    error: "加载失败",
    zoomIn: "放大",
    zoomOut: "缩小",
    rotate: "旋转",
    download: "下载",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
  },
  "en-US": {
    preview: "Preview",
    loading: "Loading",
    error: "Failed to load",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    rotate: "Rotate",
    download: "Download",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
  },
};
