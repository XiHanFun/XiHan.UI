<!-- 数值输入与屏幕取色 | 四个数值框各管一路，回车才收下，收不下的留着草稿并标红；宿主环境没有取色接口时那个按钮自己禁用 -->
<script setup lang="ts">
import {
  XhColorPickerArea,
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
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const inputRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "6px",
};

// 取色按钮里只有一个符号，读屏念的名字从这里来
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
        <XhColorPickerArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerArea>
        <div style="display: flex; align-items: center; gap: 8px">
          <XhColorPickerEyeDropperTrigger>◎</XhColorPickerEyeDropperTrigger>
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
