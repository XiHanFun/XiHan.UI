const n=`<!-- 异步候选 | 查询串每变一次就重新去远端查一遍，加载、空结果和候选共用一张浮层表面 -->
<script setup lang="ts">
import {
  XhMentionContent,
  XhMentionEmpty,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLoading,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Person {
  value: string;
  label: string;
}

const pool: Person[] = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
  { value: "linfeng", label: "林枫" },
];

const text = ref("");
const options = ref<Person[]>([]);
const loading = ref(false);
let timer = 0;

// 每次查询串变化都重开一轮查询，上一轮未落地的先撤掉
function onQuery(details: { query: string | null }): void {
  window.clearTimeout(timer);
  if (details.query === null) {
    options.value = [];
    loading.value = false;
    return;
  }
  const q = details.query.trim().toLowerCase();
  options.value = [];
  loading.value = true;
  timer = window.setTimeout(() => {
    options.value = pool.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
    loading.value = false;
  }, 500);
}
<\/script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="options"
    :loading="loading"
    placeholder="输入 @ 再打两个字试试"
    :translations="{ input: '正文', content: '提及谁' }"
    @query-change="onQuery"
  >
    <XhMentionInput />
    <XhMentionPositioner>
      <XhMentionContent>
        <XhMentionItem v-for="person in options" :key="person.value" :value="person.value">
          <XhMentionItemText>{{ person.label }}</XhMentionItemText>
        </XhMentionItem>
      </XhMentionContent>
      <XhMentionEmpty>没有匹配的人选</XhMentionEmpty>
      <XhMentionLoading>查询中…</XhMentionLoading>
    </XhMentionPositioner>
  </XhMentionRoot>
  <p>{{ loading ? "查询中…" : \`候选 \${options.length} 条\` }}</p>
</template>
`;export{n as default};
