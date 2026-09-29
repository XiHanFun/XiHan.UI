const e=`<!-- 整段拖动 | draggableRange 让两端拇指之间的轨道可以整段拖动，时间窗宽度不变地平移；按在拇指上仍只推那一个 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhSliderRoot :default-value="[9, 12]" :min="0" :max="24" draggable-range style="inline-size: 320px">
    <XhSliderLabel>会议时段（时）</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb :index="0" />
      <XhSliderThumb :index="1" />
    </XhSliderControl>
  </XhSliderRoot>
</template>
`;export{e as default};
