<!-- 受控 | 传了 value 就由宿主说了算，取色只回写不自改 -->
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
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
} from "@xihan-ui/vue";

const color = ref("#3b82f6");
</script>

<template>
  <XhColorPickerRoot v-model:value="color">
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
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
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
  <span>当前：{{ color }}</span>
</template>
