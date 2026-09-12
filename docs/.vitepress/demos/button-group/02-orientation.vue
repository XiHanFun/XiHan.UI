<!-- 方向 | 水平或垂直排列 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const actions = ["复制", "剪切", "粘贴"];
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px">
    <XhButtonGroup variant="outline">
      <XhButton v-for="a in actions" :key="a">{{ a }}</XhButton>
    </XhButtonGroup>

    <XhButtonGroup orientation="vertical" variant="outline">
      <XhButton v-for="a in actions" :key="a">{{ a }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
