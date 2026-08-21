const t=`<!-- 走向 | direction 收的是档位，四条边加四个角共八档，逐档对应 CSS 渐变的 to 边或角写法；不收任意角度 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const directions = [
  "to-right",
  "to-left",
  "to-bottom",
  "to-top",
  "to-bottom-right",
  "to-bottom-left",
  "to-top-right",
  "to-top-left",
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
    <span v-for="d in directions" :key="d">
      <XhGradientText :direction="d" from="#ff5500" to="#0055ff">{{ d }}</XhGradientText>
    </span>
  </div>
</template>
`;export{t as default};
