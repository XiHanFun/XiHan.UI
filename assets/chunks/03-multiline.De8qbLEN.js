var e=`<!-- 多行 | 长公式分行写：autoSize 给出行数上下限，问题位置带上行号，补全浮层跟着光标 -->
<script setup lang="ts">
import type { ExpressionCompletion } from "@xihan-ui/core";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import { XhExpressionInputRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const fields: ExpressionCompletion[] = [
  { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
  { label: "level", kind: "variable", detail: "文本", description: "会员等级" },
];

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: fields.map(field => field.label),
});

const formula = ref(\`IF(level == "gold",
  amount * 0.9,
  amont)\`);
<\/script>

<template>
  <XhExpressionInputRoot
    v-model:value="formula"
    label="折后金额"
    multiline
    :auto-size="{ minRows: 3, maxRows: 6 }"
    :completions="fields"
    :check="check"
  />
</template>
`;export{e as default};