const e=`<!-- 基础用法 | 一条竖向的事件流：每条一个圆点，圆点之间连一截线，末条的线自动收掉 -->
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

const events = [
  {
    at: "2026-07-01T09:12",
    label: "7 月 1 日 09:12",
    title: "订单已创建",
    description: "下单来源：网页端",
  },
  {
    at: "2026-07-01T10:30",
    label: "7 月 1 日 10:30",
    title: "已发货",
    description: "承运商已揽收",
  },
  {
    at: "2026-07-02T14:05",
    label: "7 月 2 日 14:05",
    title: "已签收",
    description: "本人签收",
  },
];
<\/script>

<template>
  <XhTimelineRoot style="max-inline-size: 360px">
    <XhTimelineItem v-for="e in events" :key="e.at">
      <XhTimelineIndicator />
      <XhTimelineConnector />
      <XhTimelineContent>
        <!-- datetime 由作者写，组件不代填机读时间 -->
        <XhTimelineTime :datetime="e.at">{{ e.label }}</XhTimelineTime>
        <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
        <XhTimelineDescription>{{ e.description }}</XhTimelineDescription>
      </XhTimelineContent>
    </XhTimelineItem>
  </XhTimelineRoot>
</template>
`;export{e as default};
