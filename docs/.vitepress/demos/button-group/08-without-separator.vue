<!-- 无分隔线 | 省略分隔线部件 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhButtonGroup :separators="false">
    <XhButton>照片</XhButton>
    <XhButton>视频</XhButton>
    <XhButton>更多</XhButton>
  </XhButtonGroup>
</template>
