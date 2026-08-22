const r=`<!-- 基础用法 | 不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动 -->
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>打开抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>筛选条件</XhDrawerTitle>
      <XhDrawerDescription>
        面板贴住右边，这是 side 的默认值。
      </XhDrawerDescription>
      <XhButton variant="solid" @click="setOpen(false)">应用并关闭</XhButton>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
`;export{r as default};
