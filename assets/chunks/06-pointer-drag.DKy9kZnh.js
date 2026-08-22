const e=`<!-- 指针拖拽 | allowPointerDrag 打开后按住轨道就能拖着走，松手落回整页；关掉则只有触摸的原生滚动 -->
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselItemGroup,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["拖我", "再拖", "还能拖", "最后一张"];
<\/script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, dragging }"
    :slide-count="slides.length"
    allow-pointer-drag
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 130px">
      <XhCarouselItemGroup>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselItemGroup>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 ·
      {{ dragging ? "正在拖" : "松手状态" }}
    </span>
  </XhCarouselRoot>
</template>
`;export{e as default};
