<!-- 数据写法 | 只给 collection、不写结构时按标准结构铺：一条一个事件，坐标列、时刻、标题与说明给了哪项铺哪项，语气只染该条的圆点 -->
<script setup lang="ts">
import type { TimelineNode } from "@xihan-ui/headless";
import { XhTimelineRoot } from "@xihan-ui/vue";

const events: TimelineNode[] = [
  { value: "submit", time: "09-25 14:20", datetime: "2026-09-25T14:20", title: "提交报销", description: "差旅费 · ¥3,280", tone: "success" },
  { value: "manager", time: "09-25 17:05", datetime: "2026-09-25T17:05", title: "部门经理通过", description: "附言“同意”", tone: "success" },
  { value: "finance", time: "09-26 10:12", datetime: "2026-09-26T10:12", title: "财务退回", description: "缺少住宿发票", tone: "danger" },
];
</script>

<template>
  <XhTimelineRoot :collection="events" style="max-inline-size: 360px" />
</template>
