<!-- 禁用 | 只表达对应动作不可用，不会降低整段文字的不透明度 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";
</script>

<template>
  <p style="display: flex; align-items: center; gap: 8px">
    当前不能按 <XhKbd value="Delete" disabled />
  </p>
</template>
