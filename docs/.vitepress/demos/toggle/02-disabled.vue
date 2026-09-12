<!-- 禁用 | 保留禁用前的状态 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle disabled>未按下</XhToggle>
  <XhToggle disabled default-pressed>已按下</XhToggle>
</template>
