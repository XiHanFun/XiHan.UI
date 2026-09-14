<!-- 竖向 | orientation 换成 vertical 后整条控件收成一块，键盘与拖动的方向跟着一起翻 -->
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
  <XhSliderRoot v-slot="{ value }" :default-value="[30]" orientation="vertical">
    <XhSliderLabel>亮度：{{ value[0] }}</XhSliderLabel>
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
