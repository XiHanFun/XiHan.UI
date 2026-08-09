<!-- 语气 | tone 决定条目高亮用哪族颜色；静止态看不出来，展开后悬停条目、或用方向键把焦点移上去才显现 -->
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 六个各自独立的菜单，逐个展开对比条目高亮底色 -->
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot v-for="tone in tones" :key="tone" :tone="tone">
      <XhMenuTrigger>{{ tone }}</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="copy">复制</XhMenuItem>
          <XhMenuItem value="rename">重命名</XhMenuItem>
          <XhMenuSeparator />
          <XhMenuItem value="delete">删除</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  </div>
</template>
