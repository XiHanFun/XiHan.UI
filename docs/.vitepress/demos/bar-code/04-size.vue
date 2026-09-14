<!-- 尺寸与静区 | barWidth 是最窄条的像素宽，整张码等比放大；height 只改条高；margin 是两侧静区的模块数 -->
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";

const value = "SIZE";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" :bar-width="1" :height="40" />
      <span style="font-size: 12px">barWidth 1 · height 40</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" />
      <span style="font-size: 12px">缺省：barWidth 2 · height 64 · margin 10</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" :bar-width="3" :height="40" :margin="2" />
      <span style="font-size: 12px">barWidth 3 · height 40 · margin 2</span>
    </div>
  </div>
</template>
