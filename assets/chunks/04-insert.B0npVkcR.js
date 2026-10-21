var e=`<!-- 插入字段 | 宿主的按钮调用 insert：在选区处插入字段名，焦点回到输入框，光标落在插入内容之后 -->
<script setup lang="ts">
import type { ExpressionCompletion } from "@xihan-ui/core";
import { createExpressionCheck, createExpressionEngine } from "@xihan-ui/expression";
import {
  XhButton,
  XhExpressionInputContent,
  XhExpressionInputControl,
  XhExpressionInputEmpty,
  XhExpressionInputHighlight,
  XhExpressionInputHighlightSegment,
  XhExpressionInputInput,
  XhExpressionInputIssue,
  XhExpressionInputIssues,
  XhExpressionInputItem,
  XhExpressionInputItemDescription,
  XhExpressionInputItemPrefix,
  XhExpressionInputItemSuffix,
  XhExpressionInputItemText,
  XhExpressionInputLabel,
  XhExpressionInputPositioner,
  XhExpressionInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const fields: ExpressionCompletion[] = [
  { label: "amount", kind: "variable", detail: "数字", description: "报销金额" },
  { label: "quantity", kind: "variable", detail: "数字", description: "数量" },
];

const check = createExpressionCheck(createExpressionEngine(), {
  identifiers: fields.map(field => field.label),
});

const formula = ref("");
<\/script>

<template>
  <!-- insert 经默认插槽交出；写了插槽就由作者摆出各部件，按钮放在标题与外框之间 -->
  <XhExpressionInputRoot
    v-slot="{ items, issues, segments, emptyText, kindText, insert }"
    v-model:value="formula"
    :completions="fields"
    :check="check"
  >
    <XhExpressionInputLabel>合计公式</XhExpressionInputLabel>
    <div style="display: flex; gap: 8px">
      <XhButton v-for="field in fields" :key="field.label" size="sm" variant="outline" @click="insert(field.label)">
        插入{{ field.description }}
      </XhButton>
    </div>
    <XhExpressionInputControl>
      <XhExpressionInputInput />
      <XhExpressionInputHighlight>
        <!-- 镜像层与输入框逐字对齐：分段文字原样写出 -->
        <XhExpressionInputHighlightSegment v-for="(segment, index) in segments" :key="index" :index="String(index)">{{ segment.text }}</XhExpressionInputHighlightSegment>
      </XhExpressionInputHighlight>
    </XhExpressionInputControl>
    <XhExpressionInputIssues>
      <XhExpressionInputIssue v-for="(issue, index) in issues" :key="index" :index="String(index)">
        {{ issue.text }}
      </XhExpressionInputIssue>
    </XhExpressionInputIssues>
    <XhExpressionInputPositioner>
      <XhExpressionInputContent>
        <XhExpressionInputItem v-for="item in items" :key="item.key" :value="item.key">
          <XhExpressionInputItemPrefix>{{ kindText(item.kind) }}</XhExpressionInputItemPrefix>
          <XhExpressionInputItemText>{{ item.label }}</XhExpressionInputItemText>
          <XhExpressionInputItemSuffix v-if="item.detail">{{ item.detail }}</XhExpressionInputItemSuffix>
          <XhExpressionInputItemDescription v-if="item.description">{{ item.description }}</XhExpressionInputItemDescription>
        </XhExpressionInputItem>
      </XhExpressionInputContent>
      <XhExpressionInputEmpty>{{ emptyText }}</XhExpressionInputEmpty>
    </XhExpressionInputPositioner>
  </XhExpressionInputRoot>
</template>
`;export{e as default};