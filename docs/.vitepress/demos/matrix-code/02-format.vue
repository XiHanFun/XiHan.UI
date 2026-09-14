<!-- 码制 | format 切到 data-matrix 就是工业打标常用的 Data Matrix：L 形定位图形、纠错率随尺寸固定；rectangular 从矩形尺寸里挑 -->
<script setup lang="ts">
import { XhMatrixCode } from "@xihan-ui/vue";

const text = "SN-2026-0915-0001";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode :value="text" :pixel-size="120" />
      <span style="font-size: 12px">qr</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode format="data-matrix" :value="text" :pixel-size="120" />
      <span style="font-size: 12px">data-matrix</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode format="data-matrix" :value="text" rectangular :pixel-size="240" />
      <span style="font-size: 12px">data-matrix · rectangular</span>
    </div>
  </div>
</template>
