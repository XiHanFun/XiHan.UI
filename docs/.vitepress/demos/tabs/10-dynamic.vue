<!-- 动态增删 | 标签清单归宿主维护；关掉当前这页时把选中值挪到相邻一项，全关完选中值是 null -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tabs = ref([
  { value: "doc-1", label: "文档 1" },
  { value: "doc-2", label: "文档 2" },
]);
const active = ref<string | null>("doc-1");
let seed = 2;

function addTab(): void {
  seed += 1;
  const value = `doc-${seed}`;
  tabs.value.push({ value, label: `文档 ${seed}` });
  active.value = value;
}

function closeTab(value: string): void {
  const index = tabs.value.findIndex((tab) => tab.value === value);
  if (index < 0) {
    return;
  }
  tabs.value.splice(index, 1);
  if (active.value !== value) {
    return;
  }
  // 关掉的正是当前页：往后顺延，没有后一项就退回最后一项
  const next = tabs.value[Math.min(index, tabs.value.length - 1)];
  active.value = next ? next.value : null;
}
</script>

<template>
  <XhTabsRoot v-model:value="active" variant="card" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhTabsList>
        <XhTabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </XhTabsTrigger>
      </XhTabsList>
      <XhButton size="sm" variant="outline" @click="addTab">新增一页</XhButton>
    </div>

    <XhTabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
      <div style="display: flex; align-items: center; gap: 8px">
        <span>{{ tab.label }} 的内容</span>
        <XhButton size="sm" variant="outline" @click="closeTab(tab.value)">
          关闭本页
        </XhButton>
      </div>
    </XhTabsContent>

    <p v-if="tabs.length === 0">已经全部关掉，当前选中值是 null。</p>
  </XhTabsRoot>
</template>
