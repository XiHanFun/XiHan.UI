const e=`<!-- 提交时机 | 输入途中只动草稿，失焦或回车才把值交给业务模型；不合法就退回上一次提交的值 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

// 草稿绑在组件上，模型只在提交那一刻更新
const draft = ref("3");
const model = ref(3);

function commit() {
  const n = Number(draft.value);
  if (draft.value === "" || !Number.isFinite(n)) {
    draft.value = String(model.value);
    return;
  }
  model.value = n;
  draft.value = String(n);
}
<\/script>

<template>
  <XhNumberFieldRoot v-model:value="draft" :min="1" :max="99">
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput @blur="commit" @keydown.enter="commit" />
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
    <span>草稿：{{ draft || "（空）" }} · 已提交：{{ model }}</span>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
