var e=`<!-- 多选 | 已选城市在输入框前排成标签 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const picked = ref<string[]>(["beijing", "chengdu"]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
<\/script>

<template>
  <XhComboboxRoot
    v-model:value="picked"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="常去城市"
    empty="无匹配城市"
    multiple
    placeholder="搜索城市"
  />
</template>
`;export{e as default};