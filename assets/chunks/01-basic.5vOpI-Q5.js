const e=`<!-- 基础用法 | 条目以 value 标识身份，禁用项方向键跳过也选不中；删除前面隔着一道分隔线 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴" },
  // 禁用项会被方向键跳过，也选不中；separatorBefore 在它前面隔一道
  { value: "delete", label: "删除", disabled: true, separatorBefore: true },
];

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
<\/script>

<template>
  <!-- 触发器的内容归作者，走 trigger 插槽 -->
  <XhMenuRoot :collection="actions" @select="onSelect">
    <template #trigger>操作</template>
  </XhMenuRoot>
  <span>最近选中：{{ picked || "（无）" }}</span>
</template>
`;export{e as default};
