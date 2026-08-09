<!-- 基础用法 | 过滤由宿主自己算：组件把输入串交给 input-value，筛出哪几条渲染成 item 是调用方的事 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

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
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    open-on-click
    placeholder="输入城市名筛选"
  >
    <XhComboboxLabel>城市</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput />
      <XhComboboxTrigger>▾</XhComboboxTrigger>
      <XhComboboxClearTrigger>✕</XhComboboxClearTrigger>
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="c in filtered" :key="c.value" :value="c.value" :disabled="c.disabled">
          <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
          <XhComboboxItemIndicator>✓</XhComboboxItemIndicator>
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
