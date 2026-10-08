var e=`<!-- 准入判定 | validate 逐个判定新标签，返回拒绝码即拒收：这一次提交整体不生效、文本留在框里改；tag-reject 报告拒收的标签与原因，重复的照常消费但也会报 -->
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const reasonText: Record<string, string> = {
  "duplicate": "已经在列表里",
  "invalid-email": "不是邮箱地址",
};

const hint = ref("");

function validate(tag: string): string | null {
  return /^[^\\s@]+@[^\\s@.]+(?:\\.[^\\s@.]+)+$/.test(tag) ? null : "invalid-email";
}

function onTagReject(details: { tags: { tag: string; reasons: string[] }[] }) {
  hint.value = details.tags
    .map(({ tag, reasons }) => \`\${tag}：\${reasons.map(r => reasonText[r] ?? r).join("、")}\`)
    .join("；");
}
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    :default-value="['ada@example.com']"
    :validate="validate"
    placeholder="输入邮箱后回车"
    style="max-inline-size: 420px"
    @tag-reject="onTagReject"
    @value-change="hint = ''"
  >
    <XhTagsInputLabel>收件人</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p v-if="hint" style="color: var(--xh-fg-danger)">{{ hint }}</p>
</template>
`;export{e as default};