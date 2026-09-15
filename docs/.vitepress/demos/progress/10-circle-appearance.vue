<!-- 环的外观 | 直径、颜色与端点经令牌，线宽经 strokeWidth：它改变的是几何，半径随之向内收缩 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <!-- 线宽是 prop：半径要跟着它变，算在几何里而不是皮肤里 -->
    <XhProgress variant="circle" :value="64" :stroke-width="2" />
    <XhProgress variant="circle" :value="64" :stroke-width="14" />

    <!-- 直径、底槽色与端点形状走令牌 -->
    <XhProgress
      variant="circle"
      :value="64"
      style="
        --xh-progress-size: 140px;
        --xh-progress-track: #e9d5ff;
        --xh-progress-range: #7c3aed;
        --xh-progress-linecap: butt;
      "
    />
  </div>
</template>
