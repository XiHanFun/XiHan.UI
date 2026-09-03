<!-- 多次调用分组 | 外面套一层手风琴当分组头：计数用等宽数位，整组开合归手风琴，卡片各管各的 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallSummary,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

const calls = [
  { name: "search", summary: '"折叠动画"', output: "找到 3 条结果。" },
  { name: "read_file", summary: "src/tool-call.css", output: "读了 214 行。" },
  { name: "apply_patch", summary: "+12 −3 src/tool-call.css", output: "已写入 1 个文件。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhAccordionRoot :default-value="['run']">
      <XhAccordionItem value="run">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>这一轮跑了的工具</span>
            <span style="display: flex; align-items: center; gap: 8px; font-size: 12px">
              <!-- 计数用等宽数位：数字变了也不会把指示器推着走 -->
              <span style="font-variant-numeric: tabular-nums">{{ calls.length }} 个</span>
              <XhAccordionIndicator />
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <XhToolCallRoot v-for="call in calls" :key="call.name" phase="output-available">
              <XhToolCallTrigger>
                <XhToolCallIndicator>›</XhToolCallIndicator>
                <XhToolCallLabel>{{ call.name }}</XhToolCallLabel>
                <XhToolCallSummary>{{ call.summary }}</XhToolCallSummary>
                <XhToolCallStatus />
              </XhToolCallTrigger>
              <XhToolCallContent>
                <XhToolCallOutput>{{ call.output }}</XhToolCallOutput>
              </XhToolCallContent>
            </XhToolCallRoot>
          </div>
        </XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
