<!-- 摘要与耗时 | 详情收起时也看得见查了什么、跑了多久；两个时刻由宿主给，组件自己不读时钟 -->
<script setup lang="ts">
import {
  XhToolCallContent,
  XhToolCallDuration,
  XhToolCallIndicator,
  XhToolCallName,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallSummary,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

// 减号是 U+2212 而不是连字符：它与数字同宽，配等宽数位才不会左右挪
const calls = [
  {
    name: "search",
    summary: '{ "query": "xihan ui 组件" }',
    startTime: 0,
    endTime: 1240,
    output: "找到 3 条结果。",
  },
  {
    name: "apply_patch",
    summary: "+12 −3 src/index.ts",
    startTime: 0,
    endTime: 420,
    output: "已写入 1 个文件。",
  },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot
      v-for="call in calls"
      :key="call.name"
      phase="output-available"
      :start-time="call.startTime"
      :end-time="call.endTime"
    >
      <template #default="{ durationMs }">
        <XhToolCallTrigger>
          <XhToolCallIndicator>›</XhToolCallIndicator>
          <XhToolCallName>{{ call.name }}</XhToolCallName>
          <XhToolCallSummary>{{ call.summary }}</XhToolCallSummary>
          <XhToolCallStatus />
          <!-- 秒数由宿主现场代入，连接层只交出毫秒数 -->
          <XhToolCallDuration v-if="durationMs !== undefined">
            {{ (durationMs / 1000).toFixed(1) }}s
          </XhToolCallDuration>
        </XhToolCallTrigger>
        <XhToolCallContent>
          <XhToolCallOutput>{{ call.output }}</XhToolCallOutput>
        </XhToolCallContent>
      </template>
    </XhToolCallRoot>
  </div>
</template>
