<!-- 码眼形状 | 只作用于三个定位图形，7×7 的外环加内心结构保持不变，读码器靠它找码 -->
<script setup lang="ts">
import { XhQrCode } from "@xihan-ui/vue";

const shapes = ["square", "rounded"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div
      v-for="shape in shapes"
      :key="shape"
      style="display: grid; gap: 6px; justify-items: center"
    >
      <XhQrCode :value="text" :eye-shape="shape" :pixel-size="128" />
      <span style="font-size: 12px">{{ shape }}</span>
    </div>
    <!-- 码点与码眼各挑各的，两条 path 分开出几何 -->
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhQrCode :value="text" module-shape="dot" eye-shape="rounded" :pixel-size="128" />
      <span style="font-size: 12px">dot + rounded</span>
    </div>
  </div>
</template>
