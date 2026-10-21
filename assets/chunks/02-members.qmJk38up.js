var e=`<!-- 成员补全 | 补全写成函数，由宿主按光标处的查询给出：在 $row. 之后只列行内字段 -->
<script setup lang="ts">
import type { ExpressionCompletion, ExpressionCompletionSource } from "@xihan-ui/core";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import { XhExpressionInputRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const roots: ExpressionCompletion[] = [
  { label: "$row", kind: "variable", detail: "对象", description: "当前行" },
  { label: "$total", kind: "variable", detail: "数字", description: "全表合计" },
];
const rowFields: ExpressionCompletion[] = [
  { label: "price", kind: "variable", detail: "数字", description: "单价" },
  { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
];

// 函数形式由宿主自己过滤：member 是点之前那串名字，word 是光标前正在写的名字
const completions: ExpressionCompletionSource = ({ word, member }) => {
  const pool = member === null ? roots : member === "$row" ? rowFields : [];
  return pool.filter(item => item.label.startsWith(word));
};

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: roots.map(item => item.label),
});

const formula = ref("$row.price * $row.quantity / $total");
<\/script>

<template>
  <XhExpressionInputRoot
    v-model:value="formula"
    label="行占比"
    :completions="completions"
    :check="check"
  />
</template>
`;export{e as default};