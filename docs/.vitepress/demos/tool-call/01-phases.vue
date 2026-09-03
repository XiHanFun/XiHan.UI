<!-- 五档阶段 | 等人批准不是在跑：闸门常驻在开关与详情之间，不会被折叠藏起来 -->
<script setup lang="ts">
import type { ToolCallPhase } from "@xihan-ui/headless";
import {
  XhToolCallApproval,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";

const phases: ToolCallPhase[] = [
  "input-streaming",
  "input-available",
  "awaiting-approval",
  "output-available",
  "output-error",
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <XhToolCallRoot v-for="phase in phases" :key="phase" :phase="phase">
      <XhToolCallTrigger>
        <XhToolCallIndicator>›</XhToolCallIndicator>
        <XhToolCallLabel>search</XhToolCallLabel>
        <XhToolCallStatus />
      </XhToolCallTrigger>
      <XhToolCallApproval>这一步要先经你批准。</XhToolCallApproval>
      <XhToolCallContent>
        <XhToolCallOutput>找到 3 条结果。</XhToolCallOutput>
      </XhToolCallContent>
    </XhToolCallRoot>
  </div>
</template>
