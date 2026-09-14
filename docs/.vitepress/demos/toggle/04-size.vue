<!-- 尺寸 | 提供三种尺寸 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <XhToggle size="sm"><XhIcon :icon="HeartIcon" />小</XhToggle>
      <XhToggle><XhIcon :icon="HeartIcon" />中</XhToggle>
      <XhToggle size="lg"><XhIcon :icon="HeartIcon" />大</XhToggle>
    </div>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhToggle icon-only aria-label="小号点赞" size="sm"><XhIcon :icon="HeartIcon" /></XhToggle>
      <XhToggle icon-only aria-label="中号点赞"><XhIcon :icon="HeartIcon" /></XhToggle>
      <XhToggle icon-only aria-label="大号点赞" size="lg"><XhIcon :icon="HeartIcon" /></XhToggle>
    </div>
  </div>
</template>
