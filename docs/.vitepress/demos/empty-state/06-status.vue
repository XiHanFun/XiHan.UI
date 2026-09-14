<!-- 结果类型 | status 只落成 data-status，皮肤据它给图标区上语气色；画什么图标仍由作者塞 -->
<script setup lang="ts">
import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "@xihan-ui/icons";
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhIcon,
} from "@xihan-ui/vue";

const results = [
  { status: "success", glyph: CheckIcon, title: "全部导入成功", description: "128 条记录已入库。" },
  { status: "warning", glyph: TriangleAlertIcon, title: "部分行被跳过", description: "有 6 行缺少必填字段。" },
  { status: "error", glyph: XIcon, title: "导入没有完成", description: "这次改动已经整体回滚。" },
  { status: "info", glyph: InfoIcon, title: "任务已排队", description: "前面还有 3 个任务在跑。" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
    <XhEmptyStateRoot
      v-for="r in results"
      :key="r.status"
      :status="r.status"
      live="off"
      size="sm"
      style="inline-size: 200px"
    >
      <XhEmptyStateIndicator><XhIcon :icon="r.glyph" /></XhEmptyStateIndicator>
      <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
      <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    </XhEmptyStateRoot>
  </div>
</template>
