<script setup lang="ts">
import { XhDialogRoot, XhDialogTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot :translations="{ close: '关闭' }">
    <XhDialogTrigger>打开对话框</XhDialogTrigger>
  </XhDialogRoot>
</template>
