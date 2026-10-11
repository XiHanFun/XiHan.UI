var e=`<!-- 提前量 | distance 把可视区沿块轴向外扩展，哨兵尚未出现就先取下一页 -->
<script setup lang="ts">
import {
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
// 滑块的值恒为数组，单滑块取第一项
const distance = ref([200]);
const items = ref(Array.from({ length: 12 }, (_, i) => \`第 \${i + 1} 条\`));
const loading = ref(false);
const rounds = ref(0);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 8; i += 1) items.value.push(\`第 \${base + i} 条\`);
    rounds.value += 1;
    loading.value = false;
  }, 400);
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <XhSliderRoot v-model:value="distance" :min="0" :max="400" :step="50">
      <XhSliderLabel>提前量</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb />
      </XhSliderControl>
    </XhSliderRoot>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 220px;
        overflow: auto;
        border: var(--xh-stroke-thin) solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
      "
    >
      <!-- 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来 -->
      <XhInfiniteScrollRoot
        :target="scrollEl"
        :distance="distance[0]"
        :loading="loading"
        @load="onLoad"
      >
        <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>
  </div>

  <span data-demo-output>{{ distance[0] }}px 触发 · 已取 {{ rounds }} 页</span>
</template>
`;export{e as default};