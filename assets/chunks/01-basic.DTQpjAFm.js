const l=`<!-- 基础用法 | 一条滑杆只调节颜色的一个通道，默认是色相：值是整个颜色串，轨道绘制的是该通道从头到尾的颜色 -->
<script setup lang="ts">
import {
  XhColorSliderControl,
  XhColorSliderHiddenInput,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("#3b82f6");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <XhColorSliderRoot v-model:value="value" name="accent">
      <XhColorSliderLabel>色相</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb>
          <XhColorSliderHiddenInput />
        </XhColorSliderThumb>
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
      <XhColorSwatch :value="value" />
      <code>{{ value }}</code>
    </span>
  </div>
</template>
`;export{l as default};
