const e=`<!-- 侧栏覆盖档 | sider-presentation="sheet" 把侧栏移出画外，唤出来时盖在内容之上；点遮罩或按 Escape 收起 -->
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderBackdrop,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhLayoutRoot
    bordered
    default-sider-collapsed
    sider-presentation="sheet"
    style="block-size: 240px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>
      <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
      <span>控制台</span>
    </XhLayoutHeader>
    <XhLayoutSiderBackdrop />
    <XhLayoutSider>导航 · 收藏 · 回收站</XhLayoutSider>
    <XhLayoutContent>
      覆盖档下侧栏不占列，内容占满整宽；面板贴住视口那条边升起来。
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
`;export{e as default};
