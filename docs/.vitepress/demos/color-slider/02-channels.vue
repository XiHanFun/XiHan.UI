<!-- 通道并排 | 几条共用同一个值、各推自己那一路；开 alpha 让推色相时透明度不丢，就拼出一个 HSV 调色面板 -->
<script setup lang="ts">
import type { ColorChannel } from "@xihan-ui/headless";
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSliderValueText,
  XhColorSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("#3b82f680");
const channels: { channel: ColorChannel; label: string }[] = [
  { channel: "hue", label: "色相" },
  { channel: "saturation", label: "饱和度" },
  { channel: "brightness", label: "明度" },
  { channel: "alpha", label: "透明度" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <!-- 四条共用一个值；alpha 显式开着，推色相 / 饱和度 / 明度时透明度那一位才留得住 -->
    <XhColorSliderRoot
      v-for="item in channels"
      :key="item.channel"
      v-model:value="value"
      :channel="item.channel"
      alpha
      size="sm"
    >
      <XhColorSliderLabel>{{ item.label }}</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb>
          <XhColorSliderValueText />
        </XhColorSliderThumb>
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
      <XhColorSwatch :value="value" size="lg" />
      <code>{{ value }}</code>
    </span>
  </div>
</template>
