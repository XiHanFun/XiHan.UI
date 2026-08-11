<!-- 受控 | 传了 sizes 就由宿主说了算；sizes-change 拖动途中连着发，sizes-change-end 松手才发一次 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [{ id: "aside", min: 20 }, { id: "main", min: 20 }];
const size = ref([30, 70]);
const lastEnd = ref("（还没拖过）");

function onSizeChangeEnd(details: { size: number[]; index: number }): void {
  lastEnd.value = `第 ${details.index} 条 → ${details.size
    .map((n) => `${Math.round(n)}%`)
    .join(" / ")}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhSplitterRoot
      v-model:sizes="size"
      :panels="panels"
      style="block-size: 140px"
      @sizes-change-end="onSizeChangeEnd"
    >
      <XhSplitterPanel :index="0">
        <p style="padding: 12px">侧栏</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger :index="0" />
      <XhSplitterPanel :index="1">
        <p style="padding: 12px">正文</p>
      </XhSplitterPanel>
    </XhSplitterRoot>

    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <button type="button" @click="size = [30, 70]">复位到 30 / 70</button>
      <span>当前：{{ size.map((n) => `${Math.round(n)}%`).join(" / ") }}</span>
      <span>上次收尾：{{ lastEnd }}</span>
    </div>
  </div>
</template>
