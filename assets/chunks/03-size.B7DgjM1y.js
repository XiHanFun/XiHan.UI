const e=`<!-- 尺寸 | size 打在组上沿继承流下发给每一枚标签，标签自己不写档位 -->
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";

const tags = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <XhTagGroupRoot :collection="tags" size="sm" label="小档" />
    <XhTagGroupRoot :collection="tags" label="缺省档" />
    <XhTagGroupRoot :collection="tags" size="lg" label="大档" />
  </div>
</template>
`;export{e as default};
