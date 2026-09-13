const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 富文本 | 排版外部 HTML 内容 -->
<script setup lang="ts">
import { XhTypographyProse, XhTypographyRoot } from "@xihan-ui/vue";

const html = \`
  <h3>安装</h3>
  <p>安装 Vue 组件和默认样式。</p>
  <pre><code>pnpm add @xihan-ui/vue @xihan-ui/styles</code></pre>
  <ul><li>组件按需引入</li><li>皮肤整份引入</li></ul>
\`;
<\/script>

<template>
  <XhTypographyRoot>
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- prose 用于渲染可信 HTML -->
    <XhTypographyProse v-html="html" />
  </XhTypographyRoot>
</template>
`;export{n as default};
