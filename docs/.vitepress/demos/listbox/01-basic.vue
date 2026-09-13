<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 从成员列表中选择一项 -->
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const members = [
  { value: "lin", name: "林知夏", email: "lin@xihan.dev", initial: "林" },
  { value: "chen", name: "陈望舒", email: "chen@xihan.dev", initial: "陈" },
  { value: "zhou", name: "周予安", email: "zhou@xihan.dev", initial: "周" },
];
</script>

<template>
  <XhListboxRoot :default-value="['lin']" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>团队成员</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="member in members" :key="member.value" :value="member.value">
        <span
          aria-hidden="true"
          style="display: grid; flex: none; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 999px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); font-weight: 600"
        >
          {{ member.initial }}
        </span>
        <XhListboxItemText>
          <span style="display: grid; gap: 2px">
            <span>{{ member.name }}</span>
            <span style="color: var(--xh-fg-subtle); font-size: var(--xh-text-caption-size)">{{ member.email }}</span>
          </span>
        </XhListboxItemText>
        <XhListboxItemIndicator />
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
</template>
