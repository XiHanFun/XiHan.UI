<!-- 候选里的自定义内容 | 条目内容由你写：主文本之外还能带副标题与标记，过滤与键盘行为一点不变 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhBadge,
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "国际", tone: "info" },
  { value: "qq", label: "name@qq.com", note: "国内", tone: "success" },
  { value: "163", label: "name@163.com", note: "国内", tone: "success" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? mailboxes : mailboxes.filter((m) => m.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    open-on-click
    placeholder="输入邮箱前缀"
  >
    <XhComboboxLabel>邮箱</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput />
      <XhComboboxTrigger />
      <XhComboboxClearTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="m in filtered" :key="m.value" :value="m.value">
          <XhComboboxItemText>
            <span style="display: inline-flex; align-items: center; gap: 8px">
              {{ m.label }}
              <XhBadge variant="subtle" :tone="m.tone" size="sm">{{ m.note }}</XhBadge>
            </span>
          </XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
