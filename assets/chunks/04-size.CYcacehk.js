const e=`<!-- 尺寸 | size 换的是留白、图标框与标题字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhResultDescription,
  XhResultIcon,
  XhResultRoot,
  XhResultTitle,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <XhResultRoot v-for="s in sizes" :key="s.label" :size="s.size" status="info">
      <XhResultIcon>i</XhResultIcon>
      <XhResultTitle>{{ s.label }}档</XhResultTitle>
      <XhResultDescription>同一段文案在三档下的留白与字号。</XhResultDescription>
    </XhResultRoot>
  </div>
</template>
`;export{e as default};
