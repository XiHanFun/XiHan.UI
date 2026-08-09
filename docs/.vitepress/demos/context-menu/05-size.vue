<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比 -->
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";

// 三块触发区共用一份外观，尺寸差别只由 size 造成
const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "96px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot size="sm">
      <XhContextMenuTrigger :style="triggerStyle">
        <span>sm</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="copy">
            <XhContextMenuItemText>复制</XhContextMenuItemText>
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

    <!-- 不写 size 就是缺省档 -->
    <XhContextMenuRoot>
      <XhContextMenuTrigger :style="triggerStyle">
        <span>缺省</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="copy">
            <XhContextMenuItemText>复制</XhContextMenuItemText>
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

    <XhContextMenuRoot size="lg">
      <XhContextMenuTrigger :style="triggerStyle">
        <span>lg</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="copy">
            <XhContextMenuItemText>复制</XhContextMenuItemText>
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
