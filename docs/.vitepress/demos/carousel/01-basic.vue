<!-- 基础用法 | 张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来 -->
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselItemGroup,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["第一张", "第二张", "第三张"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <!-- 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 -->
    <XhCarouselViewport style="block-size: 140px">
      <XhCarouselItemGroup>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselItemGroup>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <!-- 指示点一页一个，作者照着 totalPages 渲染 -->
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
