<!-- 形态 | 设置切换按钮外观 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <XhToggle v-for="variant in variants" :key="variant" :variant="variant" default-pressed>
    {{ variant }}
  </XhToggle>
</template>
