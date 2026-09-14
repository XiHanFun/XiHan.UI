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
  { at: "2026-07-01T09:12", label: "09:12", title: "订单已创建" },
  { at: "2026-07-01T10:30", label: "10:30", title: "已发货" },
  { at: "2026-07-02T14:05", label: "14:05", title: "已签收" },
];
</script>

<template>
  <XhTimelineRoot style="inline-size: 200px; font-size: 13px">
    <XhTimelineItem v-for="e in events" :key="e.at">
      <XhTimelineIndicator />
      <XhTimelineConnector />
      <XhTimelineContent>
        <XhTimelineTime :datetime="e.at">{{ e.label }}</XhTimelineTime>
        <XhTimelineTitle>{{ e.title }}</XhTimelineTitle>
      </XhTimelineContent>
    </XhTimelineItem>
  </XhTimelineRoot>
</template>
