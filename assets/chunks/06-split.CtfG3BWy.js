const n=`<!-- 分隔符 | 在相邻内容之间添加分隔符 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const linkStyle = "color: var(--xh-fg-brand); cursor: pointer";
const ruleStyle
  = "display: block; inline-size: 1px; block-size: 1em; background: var(--xh-border-default)";

const actions = ["编辑", "复制", "归档", "删除"];
<\/script>

<template>
  <XhFlex gap="sm">
    <template #split>
      <span :style="ruleStyle" />
    </template>
    <span v-for="a in actions" :key="a" :style="linkStyle">{{ a }}</span>
  </XhFlex>
</template>
`;export{n as default};
