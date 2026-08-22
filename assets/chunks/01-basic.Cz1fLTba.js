const e=`<!-- 基础用法 | 过滤由宿主自己算：组件把输入串交出来，此刻显示哪几条候选由调用方定 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter((c) => c.label.toLowerCase().includes(q));
});
<\/script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="输入城市名筛选"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
`;export{e as default};
