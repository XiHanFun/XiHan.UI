<!-- 提供 color-slider 相关实现。 -->

<script setup lang="ts">
import { XhColorSliderControl, XhColorSliderRoot, XhColorSliderThumb, XhColorSliderTrack } from "@xihan-ui/vue";
</script>

<template>
  <XhColorSliderRoot default-value="#3b82f6" style="inline-size: var(--xh-doc-catalog-w-narrow)">
    <XhColorSliderControl>
      <XhColorSliderTrack />
      <XhColorSliderThumb />
    </XhColorSliderControl>
  </XhColorSliderRoot>
</template>
