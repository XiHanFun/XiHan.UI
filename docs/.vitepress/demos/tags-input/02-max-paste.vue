<!-- 上限与粘贴拆分 | add-on-paste 让粘进来的一串按分隔符拆成多个标签；顶到 max 后再打再粘都进不去 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTagsInputClearTrigger,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tags = ref<string[]>(["Vue"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, count, atMax }"
    v-model:value="tags"
    :max="4"
    add-on-paste
    delimiter=","
    placeholder="试试粘贴 React,Svelte,Solid"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>技术栈（最多 4 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger>×</XhTagsInputItemDeleteTrigger>
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
      <XhTagsInputClearTrigger>⨯</XhTagsInputClearTrigger>
    </XhTagsInputControl>
    <span>{{ count }} / 4{{ atMax ? " · 已到上限" : "" }}</span>
  </XhTagsInputRoot>
</template>
