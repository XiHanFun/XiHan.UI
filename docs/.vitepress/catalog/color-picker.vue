<script setup lang="ts">
import { XhColorPickerControl, XhColorPickerLabel, XhColorPickerRoot, XhColorPickerSwatch, XhColorPickerTrigger, XhColorPickerValueText } from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="#00a98e">
    <XhColorPickerLabel>品牌色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
  </XhColorPickerRoot>
</template>
