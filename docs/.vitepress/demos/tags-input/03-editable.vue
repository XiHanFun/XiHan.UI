<!-- 就地编辑 | editable 打开后双击任一标签改写它：Enter 提交、Escape 撤销，改成空白等于删掉这个标签 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tags = ref<string[]>(["前端", "组件库", "无障碍"]);
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    v-model:value="tags"
    editable
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>标签</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger>×</XhTagsInputItemDeleteTrigger>
        </XhTagsInputItemPreview>
        <!-- 编辑框常挂不卸载，不编辑时由组件收起 -->
        <XhTagsInputItemInput />
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
