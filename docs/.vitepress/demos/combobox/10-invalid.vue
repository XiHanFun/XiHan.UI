<!-- 校验状态 | invalid 让输入行报 aria-invalid、描边转告警色；选出值后判定自己撤掉 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter((c) => c.label.toLowerCase().includes(q));
});
// 校验归宿主，组件只负责把这个结论铺成属性
const invalid = computed(() => value.value.length === 0);
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    :invalid="invalid"
    label="常驻城市"
    empty="无匹配城市"
    open-on-click
    placeholder="必须选一个城市"
  />
  <p v-if="invalid" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
