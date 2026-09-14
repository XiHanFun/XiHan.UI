<!-- 语气与尺寸 | tone 换指示符与状态文案的色族，size 换标题行与正文的几何档；五份都挂在思考中，正文自动展开 -->
<script setup lang="ts">
import {
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/vue";

const translations = {
  label: "思考过程",
  thinking: "正在思考…",
  thoughtFor: "想了 {seconds} 秒",
};

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "warning", size: "md", label: "warning" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhReasoningRoot
      v-for="row in rows"
      :key="row.label"
      :tone="row.tone"
      :size="row.size"
      :translations="translations"
      streaming
    >
      <XhReasoningTrigger>
        <XhReasoningIndicator />
        <XhReasoningLabel />
      </XhReasoningTrigger>
      <XhReasoningContent>{{ row.label }}：先看约束，再看目标。</XhReasoningContent>
    </XhReasoningRoot>
  </div>
</template>
