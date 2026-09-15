const e=`<!-- 横排 | orientation="horizontal" 把事件从左往右摆，连线随之转成横的一条 -->
<script setup lang="ts">
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
} from "@xihan-ui/vue";

const events = [
  { tone: "success", label: "Q1", title: "内测" },
  { tone: "success", label: "Q2", title: "公测" },
  { tone: "info", label: "Q3", title: "商业化" },
  { tone: undefined, label: "Q4", title: "海外版" },
] as const;
<\/script>

<template>
  <XhTimelineRoot orientation="horizontal" style="inline-size: 100%">
    <XhTimelineItem v-for="e in events" :key="e.label" :tone="e.tone">
      <XhTimelineIndicator />
      <XhTimelineConnector />
      <XhTimelineContent>
        <XhTimelineTime>{{ e.label }}</XhTimelineTime>
        <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
      </XhTimelineContent>
    </XhTimelineItem>
  </XhTimelineRoot>
</template>
`;export{e as default};
