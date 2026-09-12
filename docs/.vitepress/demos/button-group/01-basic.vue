<!-- 基础用法 | 组合相关操作 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup, XhButtonGroupSeparator } from "@xihan-ui/vue";

const views = ["照片", "视频", "更多"];
</script>

<template>
  <XhButtonGroup variant="subtle">
    <template v-for="(view, index) in views" :key="view">
      <XhButtonGroupSeparator v-if="index > 0" />
      <XhButton>{{ view }}</XhButton>
    </template>
  </XhButtonGroup>
</template>
