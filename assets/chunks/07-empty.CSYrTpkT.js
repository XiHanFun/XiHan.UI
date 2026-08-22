const e=`<!-- 空态 | 条目筛空时收起列表、亮出空态节点：它挂在 content 之外，方向键、连打检索与全选都看不见它 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhEmptyStateDescription,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const members = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
];

const query = ref("");
const picked = ref<string[]>([]);
const filtered = computed(() => {
  const q = query.value.trim();
  return q === "" ? members : members.filter((m) => m.label.includes(q));
});
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
    <XhTextFieldRoot v-model:value="query" placeholder="输入姓名筛选">
      <XhTextFieldLabel>搜索</XhTextFieldLabel>
      <XhTextFieldInput />
    </XhTextFieldRoot>
    <XhListboxRoot v-model:value="picked">
      <XhListboxLabel>成员</XhListboxLabel>
      <XhListboxContent :hidden="filtered.length === 0">
        <XhListboxItem v-for="m in filtered" :key="m.value" :value="m.value">
          <XhListboxItemText>{{ m.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxContent>
      <!-- 空态节点常挂、靠 hidden 收起，它自带的活区才播报得到这次筛空 -->
      <XhEmptyStateRoot size="sm" :hidden="filtered.length > 0">
        <XhEmptyStateTitle>没有匹配的成员</XhEmptyStateTitle>
        <XhEmptyStateDescription>换个关键词再试试。</XhEmptyStateDescription>
      </XhEmptyStateRoot>
    </XhListboxRoot>
  </div>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
