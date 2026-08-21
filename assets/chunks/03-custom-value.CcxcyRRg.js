const e=`<!-- 允许自由文本 | allow-custom-value 让没匹配上候选的输入也能落值，适合标签、邮箱这类开放集合 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? frameworks : frameworks.filter((f) => f.label.toLowerCase().includes(q));
});
<\/script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    label="技术栈"
    empty="没有候选，按 Enter 直接用这串文本"
    allow-custom-value
    placeholder="选一个或直接打字"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
`;export{e as default};
