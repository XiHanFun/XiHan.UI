<script setup lang="ts">
import { XhDrawerRoot, XhDrawerTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhDrawerRoot :translations="{ close: '关闭' }">
    <XhDrawerTrigger>打开抽屉</XhDrawerTrigger>
  </XhDrawerRoot>
</template>
