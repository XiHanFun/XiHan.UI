<!-- 基础用法 | trigger / content / item 三件缺一不可，positioner 负责摆位置 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
</script>

<template>
  <XhMenuRoot @select="onSelect">
    <XhMenuTrigger>操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">复制</XhMenuItem>
        <XhMenuItem value="paste">粘贴</XhMenuItem>
        <XhMenuSeparator />
        <!-- 禁用项会被方向键跳过，也选不中 -->
        <XhMenuItem value="delete" disabled>删除</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
  <span>最近选中：{{ picked || "（无）" }}</span>
</template>
