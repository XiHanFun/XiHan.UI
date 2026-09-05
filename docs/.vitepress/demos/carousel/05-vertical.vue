<!-- 纵向轨道 | orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键 -->
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

const slides = ["09:00 晨会", "11:00 客户沟通", "15:00 联调"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages }"
    orientation="vertical"
    :slide-count="slides.length"
    style="inline-size: 240px"
  >
    <XhCarouselPrevTrigger>∧</XhCarouselPrevTrigger>
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <XhCarouselViewport style="block-size: 96px; inline-size: 100%">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger>∨</XhCarouselNextTrigger>
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span>第 {{ page + 1 }} / {{ totalPages }} 条</span>
  </XhCarouselRoot>
</template>
