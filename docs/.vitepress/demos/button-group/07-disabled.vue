<!-- 禁用 | 禁用整组按钮 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhButtonGroup disabled>
    <XhButton>照片</XhButton>
    <XhButton>视频</XhButton>
    <XhButton>更多</XhButton>
  </XhButtonGroup>
</template>
