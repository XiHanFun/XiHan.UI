<!-- 预设色板 | swatches 给出常用色，选中即写回 value -->
<script setup lang="ts">
import {
  XhColorPickerArea,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerSwatchGroup,
  XhColorPickerSwatchItem,
  XhColorPickerTrigger,
} from "@xihan-ui/vue";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
</script>

<template>
  <XhColorPickerRoot default-value="#00a98e" :swatches="swatches">
    <XhColorPickerTrigger>
      <XhColorPickerSwatch />
    </XhColorPickerTrigger>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerArea>
        <XhColorPickerSwatchGroup>
          <XhColorPickerSwatchItem v-for="c in swatches" :key="c" :value="c" />
        </XhColorPickerSwatchGroup>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
