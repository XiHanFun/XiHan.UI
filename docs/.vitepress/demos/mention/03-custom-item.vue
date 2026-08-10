<!-- 候选里的自定义内容 | 手写各部件即可在候选行里放头像与职位；插回正文的那段字取自 item-text -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/vue";

const people = [
  { value: "lilei", label: "李雷", role: "前端", initials: "李" },
  { value: "hanmeimei", label: "韩梅梅", role: "设计", initials: "韩" },
  { value: "poly", label: "Poly", role: "后端", initials: "P" },
];

const text = ref("");
const query = ref<string | null>(null);
const filtered = computed(() => {
  const q = (query.value ?? "").trim().toLowerCase();
  return q === ""
    ? people
    : people.filter((p) => p.value.includes(q) || p.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhMentionRoot
    v-model:value="text"
    :translations="{ content: '提及谁' }"
    @query-change="query = $event.query"
  >
    <XhMentionInput aria-label="正文" placeholder="输入 @ 提及同事" />
    <XhMentionPositioner>
      <XhMentionContent>
        <XhMentionItem v-for="p in filtered" :key="p.value" :value="p.value">
          <XhAvatarRoot size="sm">
            <XhAvatarFallback>{{ p.initials }}</XhAvatarFallback>
          </XhAvatarRoot>
          <!-- 只有 item-text 里的字会被插进正文，职位不会跟着进去 -->
          <XhMentionItemText>{{ p.label }}</XhMentionItemText>
          <span style="color: var(--xh-fg-subtle); font-size: var(--xh-font-size-xs)">
            {{ p.role }}
          </span>
        </XhMentionItem>
      </XhMentionContent>
    </XhMentionPositioner>
  </XhMentionRoot>
  <p>正文：{{ text || "（空）" }}</p>
</template>
