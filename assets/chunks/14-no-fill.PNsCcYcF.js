const l=`<!-- 不填充轨道 | 取值没有「多少」之分时关掉 trackFill，只留底槽与拇指，免得从一端画起的区间暗示大小 -->
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
  <XhSliderRoot :default-value="[0]" :min="-50" :max="50" :track-fill="false" style="inline-size: 320px">
    <XhSliderLabel>声道平衡</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb />
    </XhSliderControl>
  </XhSliderRoot>
</template>
`;export{l as default};
