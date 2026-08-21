const e=`<!-- 受控正文与选中回调 | 正文由宿主持有，select 事件报回插进去的是哪一条，用来攒收件人名单 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhMentionRoot } from "@xihan-ui/vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const text = ref("周会纪要：");
const query = ref<string | null>(null);
const mentioned = ref<string[]>([]);

const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
});

// 名单按值去重；正文里被删掉的提及不在这里回收，需要的话按正文重新扫一遍
function onSelect(details: { value: string }): void {
  if (!mentioned.value.includes(details.value)) mentioned.value = [...mentioned.value, details.value];
}

function reset(): void {
  text.value = "";
  mentioned.value = [];
}
<\/script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :collection="filtered"
    tone="brand"
    placeholder="输入 @ 提及同事"
    :translations="{ input: '会议纪要', content: '提及谁' }"
    @query-change="query = $event.query"
    @select="onSelect"
  />
  <p>已提及：{{ mentioned.join("、") || "（无）" }}</p>
  <button type="button" @click="reset">清空</button>
</template>
`;export{e as default};
