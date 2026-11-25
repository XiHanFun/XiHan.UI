<!-- 语气与尺寸 | tone 为图标区上语气色，与全库同一根轴，绘制什么图标仍由作者放置；size 只改变留白与字号，语义不变，不传即 md -->
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
  { tone: "success", glyph: CheckIcon, title: "全部导入成功", description: "128 条记录已入库。" },
  { tone: "warning", glyph: TriangleAlertIcon, title: "部分行被跳过", description: "有 6 行缺少必填字段。" },
  { tone: "danger", glyph: XIcon, title: "导入没有完成", description: "这次改动已经整体回滚。" },
  { tone: "info", glyph: InfoIcon, title: "任务已排队", description: "前面还有 3 个任务在跑。" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-8)">
    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4)">
      <!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
      <XhEmptyStateRoot
        v-for="r in results"
        :key="r.tone"
        :tone="r.tone"
        live="off"
        size="sm"
        style="inline-size: 200px"
      >
        <XhEmptyStateIndicator><XhIcon :icon="r.glyph" /></XhEmptyStateIndicator>
        <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
        <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
      </XhEmptyStateRoot>
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4)">
      <XhEmptyStateRoot size="sm" style="inline-size: 220px">
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>sm</XhEmptyStateTitle>
        <XhEmptyStateDescription>塞进侧栏或卡片里的那一档。</XhEmptyStateDescription>
      </XhEmptyStateRoot>

      <XhEmptyStateRoot style="inline-size: 220px">
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>md</XhEmptyStateTitle>
        <XhEmptyStateDescription>缺省档，列表与表格用它。</XhEmptyStateDescription>
      </XhEmptyStateRoot>

      <XhEmptyStateRoot size="lg" style="inline-size: 220px">
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>lg</XhEmptyStateTitle>
        <XhEmptyStateDescription>整页只有这一块时用它。</XhEmptyStateDescription>
      </XhEmptyStateRoot>
    </div>
  </div>
</template>
