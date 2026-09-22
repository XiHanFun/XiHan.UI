const t=`<!-- 基础用法 | 在框中输入后按 Enter 落下一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份，预览与删除按钮就是库内的 tag -->
<script setup lang="ts">
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
import { ref } from "vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    v-model:value="tags"
    placeholder="回车落一个"
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
`;export{t as default};
