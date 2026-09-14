<!-- 基础用法 | 值恒是数组，单滑块即长度 1；方向键走一格 step，PageUp 与 PageDown 走 largeStep，Home 与 End 贴到端点 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot
    v-slot="{ value }"
    :default-value="[40]"
    :min="0"
    :max="100"
    :step="1"
    :large-step="10"
    name="volume"
    style="inline-size: 320px"
  >
    <XhSliderLabel>音量：{{ value[0] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
