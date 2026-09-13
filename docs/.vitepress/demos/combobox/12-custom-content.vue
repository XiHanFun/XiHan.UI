<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 自定义内容 | 在候选项中显示辅助信息 -->
<script setup lang="ts">
import {
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
import { computed, ref } from "vue";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "Google 邮箱" },
  { value: "qq", label: "name@qq.com", note: "QQ 邮箱" },
  { value: "163", label: "name@163.com", note: "网易邮箱" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? mailboxes : mailboxes.filter(m => m.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    open-on-click
    placeholder="搜索邮箱"
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
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span>{{ m.label }}</span>
              <small style="color: var(--xh-fg-muted)">{{ m.note }}</small>
            </span>
          </XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
</template>
