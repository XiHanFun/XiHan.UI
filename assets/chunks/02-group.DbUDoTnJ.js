const n=`<!-- 分组与标记位 | group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhContextMenuContent,
  XhContextMenuGroup,
  XhContextMenuGroupLabel,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";

const sortBy = ref("name");

function onSelect(details: { value: string }): void {
  if (details.value === "name" || details.value === "time")
    sortBy.value = details.value;
}
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot @select="onSelect">
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键看看排序与视图两组</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuGroup value="sort">
            <XhContextMenuGroupLabel>排序方式</XhContextMenuGroupLabel>
            <XhContextMenuItem value="name">
              <XhContextMenuItemIndicator>
                {{ sortBy === "name" ? "✓" : "" }}
              </XhContextMenuItemIndicator>
              <XhContextMenuItemText>按名称</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="time">
              <XhContextMenuItemIndicator>
                {{ sortBy === "time" ? "✓" : "" }}
              </XhContextMenuItemIndicator>
              <XhContextMenuItemText>按时间</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuGroup>

          <XhContextMenuSeparator />

          <XhContextMenuGroup value="view">
            <XhContextMenuGroupLabel>视图</XhContextMenuGroupLabel>
            <XhContextMenuItem value="list">
              <XhContextMenuItemText>列表</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="grid">
              <XhContextMenuItemText>网格</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuGroup>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>

    <span>当前排序：{{ sortBy === "name" ? "按名称" : "按时间" }}</span>
  </div>
</template>
`;export{n as default};
