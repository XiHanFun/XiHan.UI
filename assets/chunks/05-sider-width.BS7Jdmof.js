const n=`<!-- 侧栏宽度 | 展开与折叠各一档宽度，两档都接受任意 CSS 长度，切换时按皮肤里的过渡走 -->
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhLayoutRoot
    sider-width="220px"
    sider-collapsed-width="56px"
    bordered
    style="block-size: 220px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>
      <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
      <span>220px ⇄ 56px</span>
    </XhLayoutHeader>
    <XhLayoutSider>导航</XhLayoutSider>
    <XhLayoutContent>
      只写其中一档时，另一档仍取皮肤里的缺省宽度。
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
`;export{n as default};
