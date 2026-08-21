const n=`<!-- 分隔符 | 每两个子项之间放一份分隔符：Vue 交给 split 插槽自动铺，WC 由作者逐个写在 root 里 -->
<script setup lang="ts">
import { XhSpace } from "@xihan-ui/vue";

const linkStyle = "color: var(--xh-fg-brand); cursor: pointer";
// 分隔符部件自带 aria-hidden，这里只画那条线；display: block 让它吃得住尺寸
const ruleStyle =
  "display: block; inline-size: 1px; block-size: 1em; background: var(--xh-border-default)";

const actions = ["编辑", "复制", "归档", "删除"];
<\/script>

<template>
  <XhSpace gap="sm">
    <template #split>
      <span :style="ruleStyle"></span>
    </template>
    <span v-for="a in actions" :key="a" :style="linkStyle">{{ a }}</span>
  </XhSpace>
</template>
`;export{n as default};
