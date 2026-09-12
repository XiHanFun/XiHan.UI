const n=`<!-- 语气 | 普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色 -->
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 标记位的强调色也随语气走，这一处不必悬停就能看出来；indicator 留空串即由皮肤画勾
const commands = [
  { value: "star", label: "标记", indicator: "" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "76px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};
<\/script>

<template>
  <!-- 六块各自独立的触发区，逐块右键对比条目高亮底色 -->
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :collection="commands"
    >
      <template #trigger>
        <span :style="triggerStyle">{{ tone }}</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
`;export{n as default};
