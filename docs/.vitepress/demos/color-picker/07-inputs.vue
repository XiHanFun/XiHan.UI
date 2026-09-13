<!-- 精确输入 | 输入色值或使用屏幕取色 -->
<script setup lang="ts">
import { PipetteIcon } from "@xihan-ui/icons";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerEyeDropperTrigger,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhIcon,
} from "@xihan-ui/vue";

const inputRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "6px",
};

const translations = {
  eyeDropperTrigger: "从屏幕上取色",
};
</script>

<template>
  <XhColorPickerRoot default-value="#3b82f6" :translations="translations">
    <XhColorPickerLabel>品牌色</XhColorPickerLabel>
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
        <div style="display: flex; align-items: center; gap: 8px">
          <XhColorPickerEyeDropperTrigger><XhIcon :icon="PipetteIcon" /></XhColorPickerEyeDropperTrigger>
          <XhColorPickerChannelSlider channel="hue" style="flex: 1">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </div>
        <div :style="inputRow">
          <XhColorPickerChannelInput channel="hex" />
          <XhColorPickerChannelInput channel="r" />
          <XhColorPickerChannelInput channel="g" />
          <XhColorPickerChannelInput channel="b" />
        </div>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
