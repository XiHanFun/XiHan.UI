const n=`<!-- 多行正文 | 输入框写成 textarea，评论可以换行；插入的引用是一个整体，Backspace 整条删掉 -->
<script setup lang="ts">
import {
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLabel,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const query = ref<string | null>(null);
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
<\/script>

<template>
  <XhMentionRoot
    :collection="filtered"
    placeholder="输入 @ 提及同事，Enter 换行"
    :translations="{ content: '提及谁' }"
    @query-change="query = $event.query"
  >
    <XhMentionLabel>评论</XhMentionLabel>
    <XhMentionInput as="textarea" :rows="3" />
    <XhMentionPositioner>
      <XhMentionContent>
        <XhMentionItem v-for="p in filtered" :key="p.value" :value="p.value">
          <XhMentionItemText>{{ p.label }}</XhMentionItemText>
        </XhMentionItem>
      </XhMentionContent>
    </XhMentionPositioner>
  </XhMentionRoot>
</template>
`;export{n as default};
