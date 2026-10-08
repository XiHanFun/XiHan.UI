var e=`<!-- 常驻形态 | inline 让取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 control、trigger 与 positioner；取色面不抢焦点，也不因点外或 Esc 收起 -->
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
} from "@xihan-ui/vue";
import { ref } from "vue";

const color = ref<string[]>(["#3b82f6"]);
<\/script>

<template>
  <XhColorPickerRoot v-model:value="color" inline>
    <XhColorPickerLabel>画笔颜色</XhColorPickerLabel>
    <XhColorPickerContent>
      <XhColorPickerSaturationArea>
        <XhColorPickerAreaThumb />
      </XhColorPickerSaturationArea>
      <XhColorPickerHueSlider />
      <XhColorPickerChannelInput channel="hex" />
    </XhColorPickerContent>
  </XhColorPickerRoot>
  <p>当前：<code>{{ color[0] }}</code></p>
</template>
`;export{e as default};