<!-- 基础用法 | 只写根组件就按标准结构铺出标题与盒，标签按当前值铺；在框中输入后按 Enter 落下一个标签 -->
<script setup lang="ts">
import { XhTagsInputRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
</script>

<template>
  <XhTagsInputRoot v-model:value="tags" label="技术栈" placeholder="回车落一个" />
  <p data-demo-output>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
