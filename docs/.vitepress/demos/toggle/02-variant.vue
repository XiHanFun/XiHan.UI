<!-- 变体 | 默认与幽灵外观 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle default-pressed><XhIcon :icon="HeartIcon" />默认</XhToggle>
  <XhToggle variant="ghost"><XhIcon :icon="HeartIcon" />幽灵</XhToggle>
</template>
