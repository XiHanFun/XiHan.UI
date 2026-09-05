<!-- 图标自带语气 | 图标槽里放一枚带 tone 的图标，着色落在图标自己身上，不经过 status -->
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhIcon,
} from "@xihan-ui/vue";

const CheckCircleIcon = {
  name: "check-circle",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
  ],
} as const;

const AlertIcon = {
  name: "alert",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 4L21 19H3Z" } },
    { tag: "path", attrs: { d: "M12 10V14" } },
    { tag: "path", attrs: { d: "M12 16.5V17" } },
  ],
} as const;

const CrossCircleIcon = {
  name: "cross-circle",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M9 9L15 15" } },
    { tag: "path", attrs: { d: "M15 9L9 15" } },
  ],
} as const;

const results = [
  {
    icon: CheckCircleIcon,
    tone: "success",
    title: "全部导入成功",
    description: "128 条记录已入库，没有需要人工处理的行。",
    action: "查看结果",
  },
  {
    icon: AlertIcon,
    tone: "warning",
    title: "部分行被跳过",
    description: "有 6 行缺少必填字段，这次没有导入它们。",
    action: "下载跳过清单",
  },
  {
    icon: CrossCircleIcon,
    tone: "danger",
    title: "导入没有完成",
    description: "文件读到一半中断，这次改动已经整体回滚。",
    action: "重新上传",
  },
];
</script>

<template>
  <!-- 图标槽收任意内容，放一枚带语气的图标，着色就落在这一处，标题与说明不动 -->
  <XhEmptyStateRoot
    v-for="r in results"
    :key="r.title"
    live="off"
    size="sm"
    style="inline-size: 240px"
  >
    <XhEmptyStateIndicator>
      <XhIcon :icon="r.icon" :tone="r.tone" size="lg" />
    </XhEmptyStateIndicator>
    <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
    <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton size="sm" variant="outline">{{ r.action }}</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
