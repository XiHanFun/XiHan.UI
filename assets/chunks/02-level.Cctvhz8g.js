const e=`<!-- 纠错级别 | L / M / Q / H 依次能容忍更多污损，同样的内容也因此占更多模块 -->
<script setup lang="ts">
import { XhQrCode } from "@xihan-ui/vue";

const levels = ["L", "M", "Q", "H"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="level in levels" :key="level" style="display: grid; gap: 6px; justify-items: center">
      <XhQrCode :value="text" :level="level" :pixel-size="120" />
      <span style="font-size: 12px">{{ level }}</span>
    </div>
  </div>
</template>
`;export{e as default};
