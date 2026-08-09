<!-- 区间选择 | 两个拇指互为对方的边界、永不交叉，minStepsBetweenThumbs 再给它们之间留出格数；getValueText 把值翻成读屏念得出的话 -->
<script setup lang="ts">
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

const price = ref([200, 600]);

function valueText({ value, index }: { value: number; index: number }) {
  return `${index === 0 ? "起价" : "止价"} ${value} 元`;
}
</script>

<template>
  <XhSliderRoot
    v-model:value="price"
    :min="0"
    :max="1000"
    :step="10"
    :min-steps-between-thumbs="2"
    :get-value-text="valueText"
    name="price"
    style="inline-size: 320px"
  >
    <XhSliderLabel>价格：¥{{ price[0] }} – ¥{{ price[1] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb :index="0">
        <XhSliderHiddenInput />
      </XhSliderThumb>
      <XhSliderThumb :index="1">
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
