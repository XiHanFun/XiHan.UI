<!-- 拖动时的值气泡 | value-text 挂在 thumb 里就跟着走位；推动那一刻由皮肤放它出面，气泡里的文字取自作者的格式化函数 -->
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
  <XhSliderRoot
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
        <XhSliderValueText />
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
  <p>已选：{{ money(budget[0]) }}</p>
</template>
