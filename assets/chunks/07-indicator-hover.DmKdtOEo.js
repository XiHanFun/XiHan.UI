var e=`<!-- 指示点悬停切页 | 指示点上补一个原生 mouseenter 即为悬停切页，组件自带的点击翻页照常 -->
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];
const current = ref(0);
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages, setPage }"
    :slide-count="slides.length"
    style="inline-size: 100%"
    @page-change="current = $event.page"
  >
    <XhCarouselViewport style="block-size: 130px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselIndicatorGroup>
      <!-- mouseenter 是落到指示点按钮上的原生事件，组件自带的点击不受影响 -->
      <XhCarouselIndicator
        v-for="p in totalPages"
        :key="p"
        :index="p - 1"
        @mouseenter="setPage(p - 1)"
      />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
  <span data-demo-output>鼠标扫过圆点即可换页 · 当前第 {{ current + 1 }} / {{ slides.length }} 页</span>
</template>
`;export{e as default};