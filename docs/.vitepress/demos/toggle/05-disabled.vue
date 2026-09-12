<!-- 禁用 | 保留禁用前的状态 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle disabled><XhIcon :icon="HeartIcon" />点赞</XhToggle>
  <XhToggle disabled default-pressed><XhIcon :icon="HeartIcon" />点赞</XhToggle>
</template>
