<!-- 形态与语气 | 设置整组外观 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"];
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButtonGroup v-for="v in variants" :key="v" :variant="v" tone="brand">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>

    <XhButtonGroup variant="solid" tone="danger">
      <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
