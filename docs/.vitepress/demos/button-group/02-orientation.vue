<!-- 排布 | 横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴 -->
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
