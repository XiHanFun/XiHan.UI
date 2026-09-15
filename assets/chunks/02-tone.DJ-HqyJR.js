const e=`<!-- 逐条语气 | tone 写在条目上，只给这一条的圆点上色；不写 tone 的条目是中性圆点 -->
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
<\/script>

<template>
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
</template>
`;export{e as default};
