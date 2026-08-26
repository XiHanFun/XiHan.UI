<!-- 五种露面时机 | 缺省的 scroll-hover 滚动或指针进来都露、auto 溢出就露、always 恒露、scroll 只认滚动、hover 只认指针；收起都是淡出 -->
<script setup lang="ts">
import type { ScrollbarType } from "@xihan-ui/headless";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const types: ScrollbarType[] = ["scroll-hover", "auto", "always", "scroll", "hover"];
const boxes = ref<Record<string, HTMLElement | null>>({});
const lines = Array.from({ length: 30 }, (_, i) => `第 ${i + 1} 行`);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="type in types" :key="type" style="display: flex; flex-direction: column; gap: 6px">
      <span style="font-size: 13px; color: var(--xh-fg-muted)">type="{{ type }}"</span>
      <div style="position: relative; inline-size: 150px">
        <div
          :ref="(el) => { boxes[type] = el as HTMLElement | null }"
          style="
            block-size: 140px;
            overflow: auto;
            scrollbar-width: none;
            border: 1px solid var(--xh-border-default);
            border-radius: var(--xh-shape-surface);
            padding: 8px;
          "
        >
          <div v-for="line in lines" :key="line" style="padding-block: 2px">{{ line }}</div>
        </div>
        <XhScrollbarRoot :scrollable="() => boxes[type] ?? null" :type="type" :hide-delay="400">
          <XhScrollbarTrack>
            <XhScrollbarThumb />
          </XhScrollbarTrack>
        </XhScrollbarRoot>
      </div>
    </div>
  </div>
</template>
