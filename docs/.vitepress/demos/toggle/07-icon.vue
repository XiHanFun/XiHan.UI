<!-- 图标 | 支持图标标签和仅图标按钮 -->
<script setup lang="ts">
import { EyeIcon, StarIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle default-pressed>
    <XhIcon :icon="StarIcon" />
    收藏
  </XhToggle>
  <XhToggle icon-only aria-label="显示预览">
    <XhIcon :icon="EyeIcon" />
  </XhToggle>
</template>
