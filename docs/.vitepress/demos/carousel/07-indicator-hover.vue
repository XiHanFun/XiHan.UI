<!-- 指示点悬停切页 | 指示点上补一个原生 mouseenter 就是悬停切页，组件自带的点击翻页照旧 -->
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselItemGroup,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, setPage }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselViewport style="block-size: 130px">
      <XhCarouselItemGroup>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselItemGroup>
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
    <span style="flex-basis: 100%">
      鼠标扫过下面的圆点即可换页，当前第 {{ page + 1 }} / {{ totalPages }} 页
    </span>
  </XhCarouselRoot>
</template>
