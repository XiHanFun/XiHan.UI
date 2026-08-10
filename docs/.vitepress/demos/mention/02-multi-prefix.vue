<!-- 多种前缀 | @ 提人、# 打标签共用一个输入框，query-change 会报回是哪个前缀触发的 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhMentionRoot } from "@xihan-ui/vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const topics = [
  { value: "bug", label: "缺陷" },
  { value: "release", label: "发版" },
  { value: "design", label: "设计评审" },
];

const text = ref("");
const query = ref<string | null>(null);
const prefix = ref<string | null>(null);

// 按前缀选数据源，再按查询串筛一遍
const filtered = computed(() => {
  const pool = prefix.value === "#" ? topics : people;
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? pool
    : pool.filter((item) => item.value.includes(q) || item.label.toLowerCase().includes(q));
});

function onQuery(details: { query: string | null; prefix: string | null }): void {
  query.value = details.query;
  prefix.value = details.prefix;
}
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :prefix="['@', '#']"
    :collection="filtered"
    placeholder="@ 提及同事，# 打标签"
    :translations="{ input: '正文', content: '候选' }"
    @query-change="onQuery"
  />
  <p>当前前缀：{{ prefix ?? "（无触发）" }}</p>
</template>
