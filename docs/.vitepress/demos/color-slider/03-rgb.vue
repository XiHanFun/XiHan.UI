<!-- 红绿蓝与写法 | 推 RGB 三路走 0-255；format 决定写回的写法，这里按 rgba() 输出 -->
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

const value = ref("rgba(59, 130, 246, 1)");
const channels: { channel: ColorChannel; label: string }[] = [
  { channel: "red", label: "红" },
  { channel: "green", label: "绿" },
  { channel: "blue", label: "蓝" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <XhColorSliderRoot
      v-for="item in channels"
      :key="item.channel"
      v-model:value="value"
      :channel="item.channel"
      format="rgba"
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
