<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 侧栏位置 | 将侧栏放在行首或行尾 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <XhLayoutRoot bordered style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader>行首侧栏</XhLayoutHeader><XhLayoutSider>导航</XhLayoutSider><XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
    <XhLayoutRoot sider-placement="end" bordered style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader>行尾侧栏</XhLayoutHeader><XhLayoutSider>属性</XhLayoutSider><XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
