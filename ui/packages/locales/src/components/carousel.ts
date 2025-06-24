// 轮播组件国际化
import type { DeepPartial } from "@xihan-ui/utils";

export interface CarouselLocale {
  next: string;
  prev: string;
  goTo: string;
  slide: string;
  slideNumber: string;
}

export const CarouselLocale: Record<string, DeepPartial<CarouselLocale>> = {
  "zh-CN": {
    next: "下一个",
    prev: "上一个",
    goTo: "跳转到",
    slide: "幻灯片",
    slideNumber: "幻灯片 {index}",
  },
  "en-US": {
    next: "Next",
    prev: "Previous",
    goTo: "Go to",
    slide: "Slide",
    slideNumber: "Slide {index}",
  },
};
