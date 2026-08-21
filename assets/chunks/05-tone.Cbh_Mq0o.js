const n=`<!-- 语气 | tone 决定已填轨道与滑块用哪族颜色，不写时沿用品牌色 -->
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhSliderRoot
      v-for="t in tones"
      :key="t"
      :tone="t"
      :default-value="[60]"
      style="inline-size: 280px"
    >
      <XhSliderLabel>{{ t }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
`;export{n as default};
