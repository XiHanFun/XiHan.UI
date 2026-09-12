<!-- 换行与行内 | 换行排列或随文字排布 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const tags = ["前端", "组件库", "无障碍", "设计令牌", "键盘导航"];
const tagStyle = "padding: 4px 10px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand); font-size: 13px";
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex wrap gap="sm" style="max-inline-size: 280px">
      <span v-for="tag in tags" :key="tag" :style="tagStyle">{{ tag }}</span>
    </XhFlex>
    <div>
      当前筛选：
      <XhFlex inline gap="xs">
        <span :style="tagStyle">近 7 天</span>
        <span :style="tagStyle">已完成</span>
      </XhFlex>
    </div>
  </XhFlex>
</template>
