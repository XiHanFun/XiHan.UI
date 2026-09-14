<!-- 码制 | qr 之外还有三种：工业打标用的 Data Matrix（rectangular 从矩形尺寸里挑）、运单证件用的 PDF417、票务用的 Aztec -->
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
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode format="pdf417" :value="text" :pixel-size="240" />
      <span style="font-size: 12px">pdf417</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode format="aztec" :value="text" :pixel-size="120" />
      <span style="font-size: 12px">aztec</span>
    </div>
  </div>
</template>
