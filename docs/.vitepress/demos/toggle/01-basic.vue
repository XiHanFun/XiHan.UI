<!-- 基础用法 | 切换点赞状态 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle>
    <XhIcon :icon="HeartIcon" />
    点赞
  </XhToggle>
</template>
