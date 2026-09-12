<!-- 基础用法 | 组合相关操作 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const views = ["照片", "视频", "更多"];
</script>

<template>
  <XhButtonGroup>
    <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
  </XhButtonGroup>
</template>
