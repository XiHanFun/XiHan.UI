var e=`<!-- 待定项 | 还在等的那一步写在末尾：圆点换成转圈、去掉底色，文字说明在等什么；办成后换成普通条目 -->
<script setup lang="ts">
import {
  XhSpinner,
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
} from "@xihan-ui/vue";

const events = [
  { tone: "success", time: "09-25 14:20", title: "提交报销", description: "差旅费 · ¥3,280" },
  { tone: "success", time: "09-25 17:05", title: "部门经理通过", description: "王五 · 附言“同意”" },
] as const;
<\/script>

<template>
  <XhTimelineRoot style="max-inline-size: 360px">
    <XhTimelineItem v-for="e in events" :key="e.title" :tone="e.tone">
      <XhTimelineIndicator />
      <XhTimelineConnector />
      <XhTimelineContent>
        <XhTimelineTime>{{ e.time }}</XhTimelineTime>
        <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
        <XhTimelineDescription>{{ e.description }}</XhTimelineDescription>
      </XhTimelineContent>
    </XhTimelineItem>
    <!-- 待定的一步：没有时刻，只说在等什么 -->
    <XhTimelineItem>
      <XhTimelineIndicator style="--xh-timeline-indicator-bg: transparent">
        <XhSpinner size="sm" label="等待财务审批" />
      </XhTimelineIndicator>
      <XhTimelineContent>
        <XhTimelineTitle>等待财务审批</XhTimelineTitle>
        <XhTimelineDescription>通常在一个工作日内处理</XhTimelineDescription>
      </XhTimelineContent>
    </XhTimelineItem>
  </XhTimelineRoot>
</template>
`;export{e as default};