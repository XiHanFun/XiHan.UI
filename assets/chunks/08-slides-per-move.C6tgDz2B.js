const e=`<!-- 一次移动一张 | slidesPerMove 与 slidesPerPage 分开提供：一屏显示三张、一次只移动一张，页数按剩余张数重新计算 -->
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

const slides = ["A", "B", "C", "D", "E", "F"];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, slideRange }"
    :slide-count="slides.length"
    :slides-per-page="3"
    :slides-per-move="1"
    spacing="10px"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 110px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 · 眼下露的是第
      {{ slideRange.start + 1 }} 到 {{ slideRange.end + 1 }} 张
    </span>
  </XhCarouselRoot>
</template>
`;export{e as default};
