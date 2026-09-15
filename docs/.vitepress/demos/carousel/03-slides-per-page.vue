<!-- 一屏多张 | slidesPerPage 决定一屏显示几张，一次翻几张默认跟随它，因此仍是整屏翻页 -->
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

const slides = ["一", "二", "三", "四", "五", "六"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    :slides-per-page="2"
    spacing="12px"
    style="inline-size: 100%"
  >
    <!-- 不回绕：首页的上一张与末页的下一张转成原生 disabled -->
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 120px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            第 {{ text }} 张
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
