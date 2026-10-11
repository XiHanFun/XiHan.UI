var e=`<!-- 指针拖拽 | allowPointerDrag 开启后按住轨道即可拖动，松手落回整页；关闭则只有触摸的原生滚动 -->
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

const slides = ["拖我", "再拖", "还能拖", "最后一张"];
const page = ref(0);
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    allow-pointer-drag
    loop
    style="inline-size: 100%"
    @page-change="page = $event.page"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 130px">
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
  <span data-demo-output>第 {{ page + 1 }} / {{ slides.length }} 页</span>
</template>
`;export{e as default};