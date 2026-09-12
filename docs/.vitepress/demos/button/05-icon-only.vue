<!-- 仅图标 | 紧凑的图标操作 -->
<script setup lang="ts">
import { HeartIcon, SearchIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhButton icon-only aria-label="搜索"><XhIcon :icon="SearchIcon" /></XhButton>
  <XhButton icon-only variant="subtle" aria-label="收藏"><XhIcon :icon="HeartIcon" /></XhButton>
  <XhButton icon-only variant="outline" aria-label="搜索"><XhIcon :icon="SearchIcon" /></XhButton>
  <XhButton icon-only variant="ghost" aria-label="收藏"><XhIcon :icon="HeartIcon" /></XhButton>
</template>
