const e=`<!-- 侧栏位置 | sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边 -->
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhLayoutRoot
      sider-placement="start"
      bordered
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>侧栏在行首</XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>

    <XhLayoutRoot
      sider-placement="end"
      bordered
      style="block-size: 160px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>侧栏在行尾</XhLayoutHeader>
      <XhLayoutSider>属性面板</XhLayoutSider>
      <XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
`;export{e as default};
