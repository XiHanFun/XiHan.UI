<!-- 形态 | variant 决定颜色怎么用：实心填底、淡色填底、只描边 -->
<script setup lang="ts">
import { XhBadge } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline"] as const;
</script>

<template>
  <XhBadge v-for="v in variants" :key="v" :variant="v">{{ v }}</XhBadge>
</template>
