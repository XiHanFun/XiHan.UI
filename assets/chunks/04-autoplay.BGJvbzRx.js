const e=`<!-- 自动播放与暂停 | autoplay 给毫秒即间隔；开了它就得渲播放开关，自动翻页必须能停住 -->
<script setup lang="ts">
import {
  XhCarouselAutoplayTrigger,
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["公告一", "公告二", "公告三"];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    :autoplay="2500"
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 120px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselAutoplayTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
`;export{e as default};
