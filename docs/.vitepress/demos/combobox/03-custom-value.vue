<!-- 自定义值 | 选择候选项或输入新值 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? frameworks : frameworks.filter(f => f.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="技术栈"
    empty="按 Enter 使用当前输入"
    allow-custom-value
    placeholder="选择或输入技术栈"
  />
</template>
