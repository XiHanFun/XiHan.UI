const o=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 固定区域 | 固定页头和侧栏 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";

const rows = Array.from({ length: 12 }, (_, index) => \`内容区 \${String(index + 1).padStart(2, "0")}\`);
<\/script>

<template>
  <div style="inline-size: min(640px, 100%); block-size: 260px; overflow: auto; border-radius: var(--xh-shape-surface); background: var(--xh-bg-page)">
    <XhLayoutRoot header-fixed sider-fixed bordered style="--xh-layout-scrollport-h: 260px">
      <XhLayoutHeader><strong>控制台</strong></XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent><p v-for="row in rows" :key="row" style="margin-block: 0 16px">{{ row }}</p></XhLayoutContent>
      <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
    </XhLayoutRoot>
  </div>
</template>
`;export{o as default};
