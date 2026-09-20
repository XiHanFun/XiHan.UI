const l=`<!-- 竖直与状态 | orientation 竖排时渐变自下而上；禁用时标签换禁用前景、颜色带压暗，只读保留 Tab 位但不可调节 -->
<script setup lang="ts">
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 32px">
    <XhColorSliderRoot default-value="#f59e0b" channel="brightness" orientation="vertical">
      <XhColorSliderLabel>明度</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb />
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 240px">
      <XhColorSliderRoot default-value="#f59e0b" disabled>
        <XhColorSliderLabel>禁用</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <XhColorSliderRoot default-value="#f59e0b" read-only>
        <XhColorSliderLabel>只读</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <XhColorSliderRoot default-value="#f59e0b" invalid size="lg">
        <XhColorSliderLabel>无效（大号）</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
    </div>
  </div>
</template>
`;export{l as default};
