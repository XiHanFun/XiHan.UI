<!-- 增删标签 | 行尾的新增钮与关闭钮只发意图，标签序由数据源持有；条目上的 closable 让「概览」固定不可关 -->
<script setup lang="ts">
import {
  XhTabsAddTrigger,
  XhTabsCloseTrigger,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Tab {
  value: string;
  label: string;
  closable?: boolean;
}

const tabs = ref<Tab[]>([
  { value: "overview", label: "概览", closable: false },
  { value: "draft-1", label: "草稿 1" },
  { value: "draft-2", label: "草稿 2" },
]);
const selected = ref<string | null>("overview");
let next = 3;

// 新建的标签追加到末尾并选中它：焦点留在新增钮上，Shift+Tab 回到这枚新标签
function add(): void {
  const value = `draft-${next}`;
  tabs.value = [...tabs.value, { value, label: `草稿 ${next}` }];
  selected.value = value;
  next += 1;
}

// 关掉的是选中标签时，选中挪到原位置上的下一枚（没有就是上一枚）
function close(details: { value: string; values: string[] }): void {
  const index = tabs.value.findIndex(tab => tab.value === details.value);
  tabs.value = tabs.value.filter(tab => tab.value !== details.value);
  if (selected.value === details.value)
    selected.value = details.values[Math.min(index, details.values.length - 1)] ?? null;
}
</script>

<template>
  <XhTabsRoot
    v-model:value="selected"
    :collection="tabs"
    closable
    addable
    style="inline-size: 420px; max-inline-size: 100%"
    @tab-add="add"
    @tab-close="close"
  >
    <XhTabsList aria-label="草稿">
      <template v-for="tab in tabs" :key="tab.value">
        <XhTabsTrigger :value="tab.value">{{ tab.label }}</XhTabsTrigger>
        <XhTabsCloseTrigger :value="tab.value" />
      </template>
      <XhTabsIndicator />
    </XhTabsList>
    <XhTabsAddTrigger />

    <XhTabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}的正文。</XhTabsContent>
  </XhTabsRoot>
</template>
