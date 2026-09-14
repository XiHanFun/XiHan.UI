<!-- 透明度 | alpha 开启后值串带透明度，浮层里多一条透明度滑块；两条滑块共用同一份工作色，推色相不会把透明度归 1 -->
<script setup lang="ts">
import {
  XhColorPickerAlphaSlider,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="rgba(0, 169, 142, 0.6)" format="rgba" alpha>
    <XhColorPickerLabel>蒙版颜色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerHueSlider />
        <XhColorPickerAlphaSlider />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
