<!-- 换过渡效果 | 条目的内联样式只有尺寸与间距，位移之外的表现全归作者：把条目摞起来再按当前页调透明度与缩放，翻页、键盘与指示点一概照旧 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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

type Effect = "slide" | "fade" | "zoom";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];

const options: { key: Effect; label: string }[] = [
  { key: "slide", label: "平移" },
  { key: "fade", label: "淡入" },
  { key: "zoom", label: "缩放淡入" },
];

const effect = ref<Effect>("fade");

// 后两档把条目摞在一起，轨道那条整页位移随之作废
const groupStyle = computed(() =>
  effect.value === "slide" ? undefined : { position: "relative", transform: "none" }
);

function itemStyle(index: number, page: number): Record<string, string> | undefined {
  if (effect.value === "slide") return undefined;
  const current = index === page;
  return {
    position: "absolute",
    inset: "0",
    opacity: current ? "1" : "0",
    scale: effect.value === "zoom" && !current ? "0.9" : "1",
    transition: "opacity 320ms ease, scale 320ms ease",
  };
}
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger>‹</XhCarouselPrevTrigger>
    <XhCarouselViewport style="block-size: 140px">
      <XhCarouselItemGroup :style="groupStyle">
        <XhCarouselItem
          v-for="(text, i) in slides"
          :key="text"
          :index="i"
          :style="itemStyle(i, page)"
        >
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselItemGroup>
    </XhCarouselViewport>
    <XhCarouselNextTrigger>›</XhCarouselNextTrigger>
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <div style="flex-basis: 100%; display: flex; justify-content: center; gap: 8px">
      <button
        v-for="opt in options"
        :key="opt.key"
        type="button"
        :aria-pressed="effect === opt.key"
        @click="effect = opt.key"
      >
        {{ opt.label }}
      </button>
    </div>
  </XhCarouselRoot>
</template>
