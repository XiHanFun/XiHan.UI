const o=`<!-- 基础用法 | 取色面选择饱和度与明度，下方一条色相滑块；滑块是内嵌的颜色滑块组件，Vue / React 的挂载点不写子节点即自动铺开 -->
<script setup lang="ts">
import {
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
<\/script>

<template>
  <XhColorPickerRoot default-value="#00a98e">
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
        <XhColorPickerHueSlider />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
`;export{o as default};
