const r=`<!-- 透明度 | alpha 打开后多一条透明度滑杆，值串跟着带上透明度；关掉时透明度恒是不透明，那条滑杆整条不可用 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhColorPickerArea,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const overlay = ref("rgba(0, 169, 142, 0.6)");
<\/script>

<template>
  <XhColorPickerRoot v-model:value="overlay" format="rgba" alpha>
    <XhColorPickerLabel>蒙版颜色</XhColorPickerLabel>
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
`;export{r as default};
