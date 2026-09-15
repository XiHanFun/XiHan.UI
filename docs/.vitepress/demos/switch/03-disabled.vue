<!-- 禁用 | disabled 同时阻止指针与键盘，状态机收不到 TOGGLE -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <XhSwitch disabled />
  <XhSwitch disabled default-checked />
</template>
