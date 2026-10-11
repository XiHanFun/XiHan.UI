var e=`<!-- 一次移动一张 | slidesPerMove 与 slidesPerPage 分开提供：一屏显示三张、一次只移动一张，页数按剩余张数重新计算 -->
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
import { ref } from "vue";

const slides = ["A", "B", "C", "D", "E", "F"];
const page = ref(0);
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    :slides-per-page="3"
    :slides-per-move="1"
    spacing="10px"
    style="inline-size: 100%"
    @page-change="page = $event.page"
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
  </XhCarouselRoot>
  <!-- 六张里一屏露三张、一次挪一张，落点共四个：第 N 页从第 N 张露起 -->
  <span data-demo-output>第 {{ page + 1 }} / 4 页 · 眼下露的是第 {{ page + 1 }} 到 {{ page + 3 }} 张</span>
</template>
`;export{e as default};