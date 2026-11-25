<!-- 断词符与上限 | delimiter 给一组时其中任何一个都断词：半角逗号、全角逗号、分号都行；add-on-paste 使粘贴进来的一串照它们拆为多个标签，多行清单的换行也算；达到 maxTags 后再输入再粘贴都不能加入 -->
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

// 任何一个都断词；随表单提交的整串用第一个拼接
const delimiters = [",", "，", ";", "\n"];
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, count, atMax }"
    v-model:value="tags"
    :max-tags="4"
    add-on-paste
    :delimiter="delimiters"
    placeholder="试试粘贴 React，Svelte;Solid"
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
    <span data-demo-output>{{ count }} / 4{{ atMax ? " · 已到上限" : "" }}</span>
  </XhTagsInputRoot>
</template>
