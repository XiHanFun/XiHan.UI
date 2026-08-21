<!-- 基础用法 | 框里打字按 Enter 落一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    v-model:value="tags"
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>技术栈</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
