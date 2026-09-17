<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-2_5)">
    <XhSwitch default-checked>自动更新</XhSwitch>
    <XhSwitch>公开主页</XhSwitch>
  </div>
</template>
