<!-- 露面阈值 | visibility-height 决定滚过多少像素按钮才出现 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const threshold = ref(80);
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      滚过
      <input v-model.number="threshold" type="range" min="0" max="600" step="20" />
      {{ threshold }}px 才露面
    </label>

    <div style="position: relative">
      <div
        ref="scrollEl"
        style="
          block-size: 240px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容。</p>
      </div>

      <XhBackTopRoot
        :target="scrollEl"
        :visibility-height="threshold"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger>↑</XhBackTopTrigger>
      </XhBackTopRoot>
    </div>
  </div>
</template>
