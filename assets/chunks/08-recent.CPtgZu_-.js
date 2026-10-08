var e=`<!-- 最近使用色 | 一轮取色结束（浮层收起，或常驻形态下焦点离开取色面）且颜色变了，就记进最近使用色，最新的在最前、同色只留一份；受控写回由宿主保存，刷新后还在 -->
<script setup lang="ts">
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRecentSwatchPicker,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 宿主自己决定存在哪：这里演示放进一个 ref，真实场景可以存进本地存储或用户偏好
const recent = ref<string[]>(["#ef4444", "#f59e0b"]);
<\/script>

<template>
  <XhColorPickerRoot
    v-slot="{ clearRecentColors }"
    v-model:recent-colors="recent"
    default-value="#3b82f6"
    :max-recent-colors="6"
  >
    <XhColorPickerLabel>标记颜色</XhColorPickerLabel>
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
        <XhColorPickerRecentSwatchPicker />
        <XhButton v-if="recent.length" size="sm" variant="ghost" @click="clearRecentColors()">清空最近使用</XhButton>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
`;export{e as default};