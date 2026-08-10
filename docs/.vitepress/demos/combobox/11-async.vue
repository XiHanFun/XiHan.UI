<!-- 异步候选 | 输入串每变一次就重新去远端查一遍，等结果的这段时间候选为空、由空态节点顶上 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

interface City {
  value: string;
  label: string;
}

const pool: City[] = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const options = ref<City[]>([]);
const loading = ref(false);
let timer = 0;

// 每次输入都重开一轮查询，上一轮未落地的先撤掉
function onSearch(details: { inputValue: string }): void {
  window.clearTimeout(timer);
  const q = details.inputValue.trim().toLowerCase();
  options.value = [];
  if (q === "") {
    loading.value = false;
    return;
  }
  loading.value = true;
  timer = window.setTimeout(() => {
    options.value = pool.filter((c) => c.label.toLowerCase().includes(q));
    loading.value = false;
  }, 600);
}
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    :collection="options"
    label="城市"
    :empty="loading ? '查询中…' : '无匹配城市'"
    placeholder="输入城市名查询"
    @input-value-change="onSearch"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
