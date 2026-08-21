const n=`<!-- 手动激活 | activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "daily", label: "日报" },
  { value: "weekly", label: "周报" },
  { value: "monthly", label: "月报" },
];
<\/script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="daily"
    activation-mode="manual"
    style="inline-size: 100%"
  >
    <template #panel="node">{{ node.label }}面板</template>
  </XhTabsRoot>
</template>
`;export{n as default};
