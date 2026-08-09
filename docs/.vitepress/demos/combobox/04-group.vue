<!-- 分组 | 候选分段展示；整段被筛空时连同段标题一起不渲染，列表里不留空壳 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemGroup,
  XhComboboxItemGroupLabel,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q === "") return groups;
  return groups
    .map((g) => ({ ...g, items: g.items.filter((c) => c.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    open-on-click
    placeholder="按大洲分组"
  >
    <XhComboboxLabel>城市</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput />
      <XhComboboxTrigger>▾</XhComboboxTrigger>
      <XhComboboxClearTrigger>✕</XhComboboxClearTrigger>
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItemGroup v-for="g in filtered" :key="g.value" :value="g.value">
          <XhComboboxItemGroupLabel>{{ g.label }}</XhComboboxItemGroupLabel>
          <XhComboboxItem v-for="c in g.items" :key="c.value" :value="c.value">
            <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
            <XhComboboxItemIndicator>✓</XhComboboxItemIndicator>
          </XhComboboxItem>
        </XhComboboxItemGroup>
      </XhComboboxContent>
      <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
