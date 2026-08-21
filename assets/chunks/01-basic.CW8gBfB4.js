const e=`<!-- 基础用法 | 在正文里敲 @ 才开候选，选中的那条被插到光标处，前后文一字不动 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhMentionRoot } from "@xihan-ui/vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
  { value: "ghost", label: "幽灵（已离职）", disabled: true },
];

const text = ref("");
const query = ref<string | null>(null);

// 过滤是调用方的活儿：组件只把 @ 到光标之间那段交出来
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
<\/script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="filtered"
    placeholder="写点什么，输入 @ 提及同事"
    :translations="{ input: '正文', content: '提及谁' }"
    @query-change="query = $event.query"
  />
  <p>正文：{{ text || "（空）" }}</p>
</template>
`;export{e as default};
