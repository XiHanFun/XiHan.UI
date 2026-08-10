<!-- 拖动时的值气泡 | thumb 自己是定位上下文，气泡挂在它上方就跟着走位；dragging 决定露不露面，气泡里的文字由作者的格式化函数产出 -->
<script setup lang="ts">
import type { CSSProperties } from "vue";
import { ref } from "vue";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const budget = ref([1800]);

function money(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

// 读屏走 aria-valuetext，与可见气泡各念各的同一个值
function valueText({ value }: { value: number }) {
  return money(value);
}

const bubble: CSSProperties = {
  position: "absolute",
  insetBlockEnd: "100%",
  insetInlineStart: "50%",
  transform: "translateX(-50%)",
  marginBlockEnd: "8px",
  padding: "2px 8px",
  borderRadius: "var(--xh-shape-control)",
  background: "var(--xh-bg-brand)",
  color: "var(--xh-fg-on-brand)",
  fontSize: "11px",
  lineHeight: "18px",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};
</script>

<template>
  <XhSliderRoot
    v-slot="{ value, dragging }"
    v-model:value="budget"
    :min="0"
    :max="5000"
    :step="50"
    :get-value-text="valueText"
    name="budget"
    style="inline-size: 320px; --xh-slider-gap: 32px"
  >
    <XhSliderLabel>预算上限：{{ money(budget[0]) }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <span v-if="dragging" :style="bubble">{{ money(value[0]) }}</span>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
