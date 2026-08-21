const o=`<!-- 两端颜色 | from 与 to 收颜色值，落成根上的 CSS 变量；写令牌或写具体色值都行 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const pairs = [
  { from: "#ff5500", to: "#ff0088" },
  { from: "#00b8d9", to: "#6554c0" },
  { from: "var(--xh-color-success-500)", to: "var(--xh-color-info-600)" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; font-size: 28px; font-weight: 700">
    <p v-for="p in pairs" :key="p.from">
      <XhGradientText :from="p.from" :to="p.to">从 {{ p.from }} 渐到 {{ p.to }}</XhGradientText>
    </p>
  </div>
</template>
`;export{o as default};
