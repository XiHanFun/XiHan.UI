<!-- 仅图标 | 为每个图标按钮提供可访问名称 -->
<script setup lang="ts">
import { BookmarkIcon, HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle icon-only aria-label="点赞">
    <XhIcon :icon="HeartIcon" />
  </XhToggle>
  <XhToggle icon-only aria-label="收藏" variant="ghost">
    <XhIcon :icon="BookmarkIcon" />
  </XhToggle>
</template>
