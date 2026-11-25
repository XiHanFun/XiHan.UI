<!-- 语气与尺寸 | tone 写在条目上，只为该条的圆点上色，不写 tone 的条目是中性圆点；size 改变圆点直径、条目间距与字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
} from "@xihan-ui/vue";

// 第一条不写 tone，用 undefined 表达
const events = [
  { tone: undefined, label: "09:12", title: "收到请求", description: "队列长度 3" },
  { tone: "info", label: "09:13", title: "开始构建", description: "拉取依赖" },
  { tone: "warning", label: "09:21", title: "两条依赖有告警", description: "已按锁文件继续" },
  { tone: "danger", label: "09:26", title: "单元测试失败", description: "3 个用例未通过" },
  { tone: "success", label: "09:41", title: "重跑后通过", description: "产物已上传" },
] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const steps = [
  { title: "提交", description: "12 个文件" },
  { title: "合并", description: "两条评审意见" },
];
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-8)">
    <XhTimelineRoot style="max-inline-size: 360px">
      <XhTimelineItem v-for="e in events" :key="e.title" :tone="e.tone">
        <XhTimelineIndicator />
        <XhTimelineConnector />
        <XhTimelineContent>
          <XhTimelineTime>{{ e.label }}</XhTimelineTime>
          <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
          <XhTimelineDescription>{{ e.description }}</XhTimelineDescription>
        </XhTimelineContent>
      </XhTimelineItem>
    </XhTimelineRoot>

    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-6)">
      <div v-for="s in sizes" :key="s.label" style="inline-size: 200px">
        <div style="margin-block-end: var(--xh-space-2); color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">
          {{ s.label }}
        </div>
        <XhTimelineRoot :size="s.size">
          <XhTimelineItem v-for="e in steps" :key="e.title">
            <XhTimelineIndicator />
            <XhTimelineConnector />
            <XhTimelineContent>
              <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
              <XhTimelineDescription>{{ e.description }}</XhTimelineDescription>
            </XhTimelineContent>
          </XhTimelineItem>
        </XhTimelineRoot>
      </div>
    </div>
  </div>
</template>
