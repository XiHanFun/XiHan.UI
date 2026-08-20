<!-- 形态 | variant 决定颜色怎么用：实心填底、淡色填底、只描边 -->
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot v-for="v in variants" :key="v" :variant="v" tone="brand">
      <XhTagLabel>{{ v }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
