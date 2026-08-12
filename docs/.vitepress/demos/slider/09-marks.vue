<!-- 轨道刻度 | XhSliderMarks 按 marks 整组自动铺：圆点钉在轨道上、文案排在下方且点按跳值，落进已选区间的刻度分段上色；snapToMarks 让拖动/点按/键盘只认刻度落点 -->
<script setup lang="ts">
import type { SliderMark } from "@xihan-ui/headless";
import { ref } from "vue";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderMarks,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const marks: SliderMark[] = [
  { value: 0, label: "0°C" },
  { value: 26, label: "26°C" },
  { value: 37, label: "37°C" },
  { value: 100, label: "沸腾" },
];

const free = ref([26]);
const snapped = ref([37]);
</script>

<template>
  <div style="display: grid; gap: 40px; inline-size: 320px">
    <XhSliderRoot v-model:value="free" :marks="marks">
      <XhSliderLabel>自由落点（点文案跳值）</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderMarks />
        <XhSliderThumb :index="0" />
        <XhSliderHiddenInput :index="0" />
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot v-model:value="snapped" :marks="marks" snap-to-marks>
      <XhSliderLabel>只认刻度（拖动与方向键都吸档）</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderMarks />
        <XhSliderThumb :index="0" />
        <XhSliderHiddenInput :index="0" />
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
