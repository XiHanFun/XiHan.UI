<!-- 禁用 | disabled 同时挡住指针与键盘，按下态保持原样 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle disabled>未按下</XhToggle>
  <XhToggle disabled default-pressed>已按下</XhToggle>
</template>
