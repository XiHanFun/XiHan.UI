<!-- 形态 | variant 换正文框的描边与底色，候选面板不受影响 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhMentionRoot } from "@xihan-ui/vue";

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
    : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhMentionRoot
      v-for="variant in ['outline', 'subtle', 'ghost']"
      :key="variant"
      :variant="variant"
      :collection="filtered"
      :placeholder="`${variant} 档，输入 @ 提及同事`"
      :translations="{ input: '正文', content: '提及谁' }"
      @query-change="query = $event.query"
    />
  </div>
</template>
