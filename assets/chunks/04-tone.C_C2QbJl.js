const n=`<!-- 语气 | 普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色 -->
<script setup lang="ts">
import { XhMenuRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const actions = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];
<\/script>

<template>
  <!-- 六个各自独立的菜单，逐个展开对比条目高亮底色 -->
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot v-for="tone in tones" :key="tone" :collection="actions" :tone="tone">
      <template #trigger>{{ tone }}</template>
    </XhMenuRoot>
  </div>
</template>
`;export{n as default};
