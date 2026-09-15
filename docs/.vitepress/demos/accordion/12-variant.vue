<!-- 变体 | plain 不绘制外壳，surface 连成单一表面，bordered 逐条绘制边框；三档只改变与页面分开的方式 -->
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const panels = [
  { value: "shipping", label: "配送方式", content: "下单后 48 小时内发出。" },
  { value: "refund", label: "退换政策", content: "签收 7 天内可申请退换。" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
    <XhAccordionRoot
      v-for="variant in ['plain', 'surface', 'bordered']"
      :key="variant"
      :variant="variant"
      :collection="panels"
      :default-value="['shipping']"
    />
  </div>
</template>
