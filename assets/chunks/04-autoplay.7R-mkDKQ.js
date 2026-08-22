const e=`<!-- 自动播放与回绕 | autoplay 给毫秒即间隔，鼠标停上去或焦点走进来都会把计时按住 -->
<script setup lang="ts">
import {
  XhCarouselItem,
  XhCarouselItemGroup,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["公告一", "公告二", "公告三"];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, autoplaying, paused }"
    :slide-count="slides.length"
    :autoplay="2500"
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 120px">
      <XhCarouselItemGroup>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselItemGroup>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <!-- root 自己就是会换行的横排 flex，回显想独占一行得自己占满 -->
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 ·
      {{ autoplaying ? "自动播放中" : paused ? "被按住" : "已停" }}
    </span>
  </XhCarouselRoot>
</template>
`;export{e as default};
