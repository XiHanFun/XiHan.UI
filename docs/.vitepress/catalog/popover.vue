<script setup lang="ts">
import { XhPopoverRoot, XhPopoverTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhPopoverRoot placement="bottom-start" :translations="{ close: '关闭' }">
    <XhPopoverTrigger>订阅设置</XhPopoverTrigger>
  </XhPopoverRoot>
</template>
