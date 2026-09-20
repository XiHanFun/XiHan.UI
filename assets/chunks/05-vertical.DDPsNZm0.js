const e=`<!-- 纵向轨道 | orientation 换为 vertical 后轨道竖向位移，两端按钮落到上下两端，翻页识别上下方向键 -->
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
  { time: "09:00", title: "晨会", description: "同步今天的目标与阻塞项。" },
  { time: "11:00", title: "客户沟通", description: "确认需求范围与交付节奏。" },
  { time: "15:00", title: "联调", description: "核对三端行为与视觉结果。" },
];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    orientation="vertical"
    :slide-count="slides.length"
    style="inline-size: min(360px, 100%)"
  >
    <XhCarouselPrevTrigger />
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <XhCarouselViewport style="block-size: 200px; inline-size: 100%">
      <XhCarouselList>
        <XhCarouselItem v-for="(slide, i) in slides" :key="slide.time" :index="i">
          <article style="display: grid; align-content: center; gap: 6px; block-size: 100%; padding: 32px; background: var(--xh-bg-subtle); color: var(--xh-fg-default)">
            <span style="color: var(--xh-fg-brand); font-size: var(--xh-text-caption-size)">{{ slide.time }}</span>
            <strong style="color: var(--xh-fg-default); font-size: var(--xh-text-heading-3-size)">{{ slide.title }}</strong>
            <span style="color: var(--xh-fg-muted)">{{ slide.description }}</span>
          </article>
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
