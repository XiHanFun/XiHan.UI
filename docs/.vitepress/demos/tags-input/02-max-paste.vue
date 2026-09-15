<!-- 上限与粘贴拆分 | add-on-paste 使粘贴进来的一串按分隔符拆为多个标签；达到 max 后再输入再粘贴都不能加入 -->
<script setup lang="ts">
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
import { ref } from "vue";

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
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
      <XhTagsInputClearTrigger />
    </XhTagsInputControl>
    <span>{{ count }} / 4{{ atMax ? " · 已到上限" : "" }}</span>
  </XhTagsInputRoot>
</template>
