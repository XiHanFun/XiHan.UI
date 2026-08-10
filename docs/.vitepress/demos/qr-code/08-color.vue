<!-- 换色 | 颜色不是 props，写三个 CSS 变量即可：码点必须比底色深且对比要足，反相码一部分读码器不认 -->
<script setup lang="ts">
import { XhQrCode } from "@xihan-ui/vue";

const text = "https://ui.xihanfun.com";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhQrCode :value="text" :size="128" />
      <span style="font-size: 12px">缺省</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <!-- 只换码点色，码眼跟着走 -->
      <XhQrCode :value="text" :size="128" style="--xh-qr-code-fg: #1d4ed8" />
      <span style="font-size: 12px">深蓝码点</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <!-- 码眼单独挑一个色，挖空矩形跟着底色走，两处必须一致 -->
      <XhQrCode
        :value="text"
        :size="128"
        eye-shape="rounded"
        style="--xh-qr-code-bg: #fff7ed; --xh-qr-code-fg: #431407; --xh-qr-code-eye-fg: #c2410c"
      />
      <span style="font-size: 12px">暖底 + 独立码眼色</span>
    </div>
  </div>
</template>
