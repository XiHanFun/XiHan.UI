<!-- 用作结果页 | 同一套部件也承载 404、403 这类结果：status 给图标区上语气色，操作槽里放回退出口 -->
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";

const results = [
  {
    status: "404" as const,
    glyph: "?",
    title: "404 页面不存在",
    description: "地址可能敲错了，或者这条记录已经被删掉。",
    action: "回到首页",
  },
  {
    status: "403" as const,
    glyph: "⊘",
    title: "403 没有权限",
    description: "这块内容需要更高的角色，找管理员要一下。",
    action: "申请权限",
  },
  {
    status: "500" as const,
    glyph: "!",
    title: "500 服务出错",
    description: "请求没能处理完，稍后再试一次。",
    action: "重试",
  },
];
</script>

<template>
  <!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
  <XhEmptyStateRoot
    v-for="r in results"
    :key="r.title"
    :status="r.status"
    live="off"
    size="sm"
    style="inline-size: 240px"
  >
    <XhEmptyStateIndicator>{{ r.glyph }}</XhEmptyStateIndicator>
    <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
    <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton size="sm" variant="outline">{{ r.action }}</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
