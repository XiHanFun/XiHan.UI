<!-- 滑块中的内容 | thumb 是一个普通容器，放置什么由作者决定，容纳空间依靠 --xh-slider-thumb-size 撑开直径；value-text 挂在 thumb 中即随之移动，推动时由皮肤显示成值气泡，文字取自作者的格式化函数 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSliderValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const badge = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  blockSize: "100%",
  fontSize: "11px",
  color: "var(--xh-fg-on-brand)",
};

const budget = ref([1800]);

function money(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

// 读屏走 aria-valuetext，与可见气泡各念各的同一个值
function valueText({ value }: { value: number }) {
  return money(value);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-8)">
    <XhSliderRoot
      v-slot="{ value }"
      :default-value="[45]"
      :step="5"
      style="inline-size: 320px; --xh-slider-thumb-size: 34px"
    >
      <XhSliderLabel>完成度</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <span :style="badge">{{ value[0] }}%</span>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot
      v-model:value="budget"
      :min="0"
      :max="5000"
      :step="50"
      :get-value-text="valueText"
      name="budget"
      style="inline-size: 320px; --xh-slider-gap: var(--xh-space-8)"
    >
      <XhSliderLabel>预算上限：{{ money(budget[0]) }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderValueText />
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
    <p data-demo-output>已选：{{ money(budget[0]) }}</p>
  </div>
</template>
