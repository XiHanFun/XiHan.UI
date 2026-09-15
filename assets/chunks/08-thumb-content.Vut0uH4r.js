const n=`<!-- 滑块里的内容 | thumb 是个普通容器，往里放什么都由作者说了算；放得下靠 --xh-slider-thumb-size 把直径撑开 -->
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const badge = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  blockSize: "100%",
  fontSize: "11px",
  color: "var(--xh-fg-on-brand)",
};
<\/script>

<template>
  <XhSliderRoot
    v-slot="{ value }"
    :default-value="[45]"
    :step="5"
    style="inline-size: 320px; --xh-slider-thumb-size: 34px"
  >
    <XhSliderLabel>完成度</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <span :style="badge">{{ value[0] }}%</span>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
`;export{n as default};
