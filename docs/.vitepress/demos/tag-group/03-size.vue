<!-- 尺寸 | size 写在组上逐个落到每个标签上，使用 tag 的三档，标签自身不写档位 -->
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";

const tags = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <XhTagGroupRoot :collection="tags" size="sm" label="小档" />
    <XhTagGroupRoot :collection="tags" label="缺省档" />
    <XhTagGroupRoot :collection="tags" size="lg" label="大档" />
  </div>
</template>
