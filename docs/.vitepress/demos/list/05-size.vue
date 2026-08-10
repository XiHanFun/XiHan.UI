<!-- 尺寸 | size 换的是条目的内边距、图文间距与两行文字的字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhListRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      bordered
      split
      style="inline-size: 200px"
    >
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>{{ s.label }}</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>第二条</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
  </div>
</template>
