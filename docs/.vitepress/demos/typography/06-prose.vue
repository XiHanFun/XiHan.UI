<!-- 富文本 | prose 收外来的整段 HTML：节点由内容自己带，样式按标签给 -->
<script setup lang="ts">
import { XhTypographyProse, XhTypographyRoot } from "@xihan-ui/vue";

// Markdown 渲染器产出的那一串 HTML，这里直接写死当样例
const html = `
  <h3>安装</h3>
  <p>包管理器装上 <code>@xihan-ui/vue</code>，再把皮肤引进来。</p>
  <pre><code>pnpm add @xihan-ui/vue @xihan-ui/styles</code></pre>
  <ul><li>组件按需引入</li><li>皮肤整份引入</li></ul>
  <blockquote>皮肤只引一次，重复引入会让层序失效。</blockquote>
`;
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyProse v-html="html" />
  </XhTypographyRoot>
</template>
