<!-- 提供 color-slider 相关实现。 -->

<script setup lang="ts">
import { XhColorSliderControl, XhColorSliderRoot, XhColorSliderThumb, XhColorSliderTrack } from "@xihan-ui/vue";
</script>

<template>
  <XhColorSliderRoot default-value="#3b82f6" size="sm" style="inline-size: 160px">
    <XhColorSliderControl>
      <XhColorSliderTrack />
      <XhColorSliderThumb />
    </XhColorSliderControl>
  </XhColorSliderRoot>
</template>
