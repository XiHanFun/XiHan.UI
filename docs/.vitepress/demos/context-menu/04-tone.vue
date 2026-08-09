<!-- 语气 | tone 决定条目高亮与标记位用哪族颜色；高亮静止态看不出来，右键弹出后悬停条目、或用方向键把焦点移上去才显现 -->
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 六块各自独立的触发区，逐块右键对比条目高亮底色 -->
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot v-for="tone in tones" :key="tone" :tone="tone">
      <XhContextMenuTrigger
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>{{ tone }}</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <!-- 标记位的强调色也随语气走，这一处不必悬停就能看出来 -->
          <XhContextMenuItem value="star">
            <XhContextMenuItemIndicator>✓</XhContextMenuItemIndicator>
            <XhContextMenuItemText>标记</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="rename">
            <XhContextMenuItemText>重命名</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhContextMenuItemText>删除</XhContextMenuItemText>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  </div>
</template>
