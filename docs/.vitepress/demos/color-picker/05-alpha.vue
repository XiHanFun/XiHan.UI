<!-- 透明度 | 调整颜色透明度 -->
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
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
        <XhColorPickerChannelSlider channel="hue">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
        <XhColorPickerChannelSlider channel="alpha">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
