<!-- 尺寸 | 设置整组尺寸 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhButtonGroup v-for="s in sizes" :key="s" :size="s">
      <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
