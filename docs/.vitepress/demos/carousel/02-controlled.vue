<!-- 受控 | 传了 page 就由宿主说了算，组件只发 page-change 不自己改页码；v-model:page 是它的语法糖 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCarouselItem,
  XhCarouselItemGroup,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["登录", "选套餐", "付款"];
const page = ref(1);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhCarouselRoot v-model:page="page" :slide-count="slides.length">
      <XhCarouselPrevTrigger>‹</XhCarouselPrevTrigger>
      <XhCarouselViewport style="block-size: 120px">
        <XhCarouselItemGroup>
          <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
            <div style="display: grid; place-items: center; block-size: 100%">
              {{ text }}
            </div>
          </XhCarouselItem>
        </XhCarouselItemGroup>
      </XhCarouselViewport>
      <XhCarouselNextTrigger>›</XhCarouselNextTrigger>
    </XhCarouselRoot>

    <!-- 页码握在宿主手里，外部按钮直接改它 -->
    <div style="display: flex; align-items: center; gap: 8px">
      <button
        v-for="(text, i) in slides"
        :key="text"
        type="button"
        @click="page = i"
      >
        跳到「{{ text }}」
      </button>
      <span>当前第 {{ page + 1 }} 张</span>
    </div>
  </div>
</template>
