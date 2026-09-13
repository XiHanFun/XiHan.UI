<!-- 基础用法 | 张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来 -->
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = [
  {
    eyebrow: "设计系统",
    title: "一套视觉语言",
    description: "令牌、皮肤与组件共享同一组设计决策。",
    background: "var(--xh-bg-brand-subtle)",
  },
  {
    eyebrow: "无障碍",
    title: "键盘与读屏一致",
    description: "交互状态由无头内核统一维护。",
    background: "color-mix(in oklab, var(--xh-fg-success) 12%, var(--xh-bg-surface))",
  },
  {
    eyebrow: "跨框架",
    title: "Vue、React 与 Web Components",
    description: "同一份行为契约，对齐三种渲染方式。",
    background: "color-mix(in oklab, var(--xh-fg-warning) 12%, var(--xh-bg-surface))",
  },
];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <!-- 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 -->
    <XhCarouselViewport style="block-size: 176px">
      <XhCarouselList>
        <XhCarouselItem v-for="(slide, i) in slides" :key="slide.title" :index="i">
          <article
            :style="{
              display: 'grid',
              alignContent: 'end',
              gap: '6px',
              blockSize: '100%',
              padding: '24px',
              background: slide.background,
            }"
          >
            <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">
              {{ slide.eyebrow }}
            </span>
            <strong style="font-size: var(--xh-text-heading-3-size)">{{ slide.title }}</strong>
            <span style="color: var(--xh-fg-muted)">{{ slide.description }}</span>
          </article>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <!-- 指示点一页一个，作者照着 totalPages 渲染 -->
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
