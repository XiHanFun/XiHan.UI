<!-- GS1 | gs1 打开后最前面放 FNC1，读码器把内容当 GS1 元素串：变长 AI 后面用 GS（U+001D）隔开下一个；医药 UDI 用 GS1 DataMatrix，零售 2D 迁移用 GS1 QR -->
<script setup lang="ts">
import { XhMatrixCode } from "@xihan-ui/vue";

// GS 是控制字符，用码点写；(01) GTIN 定长 14 位、(17) 有效期定长 6 位、(10) 批号变长——它后面才需要分隔，(21) 序列号收尾
const GS = String.fromCharCode(0x1D);
const value = ["0109501101530003", "17250630", "10ABC123", GS, "21SN001"].join("");
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode format="data-matrix" :value="value" gs1 :pixel-size="120" label="GS1 DataMatrix" />
      <span style="font-size: 12px">GS1 DataMatrix</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode :value="value" gs1 :pixel-size="120" label="GS1 QR" />
      <span style="font-size: 12px">GS1 QR</span>
    </div>
    <span style="font-size: 12px">(01)09501101530003 (17)250630 (10)ABC123 (21)SN001</span>
  </div>
</template>
