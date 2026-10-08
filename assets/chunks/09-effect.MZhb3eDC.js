var e=`<!-- 淡入淡出换页 | effect="fade" 把各张叠放在同一格：翻页时新一张淡入、旧一张同时淡出，轨道不位移；按钮、键盘、指示点与循环照常，减弱动效下直接换 -->
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
  { title: "城市夜景", background: "var(--xh-bg-brand-subtle)" },
  { title: "海岸线", background: "color-mix(in oklab, var(--xh-fg-success) 12%, var(--xh-bg-surface))" },
  { title: "雪山", background: "color-mix(in oklab, var(--xh-fg-warning) 12%, var(--xh-bg-surface))" },
];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    effect="fade"
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 176px">
      <XhCarouselList>
        <XhCarouselItem v-for="(slide, i) in slides" :key="slide.title" :index="i">
          <div
            :style="{
              display: 'grid',
              placeItems: 'center',
              blockSize: '100%',
              background: slide.background,
              color: 'var(--xh-fg-default)',
            }"
          >
            {{ slide.title }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
`;export{e as default};