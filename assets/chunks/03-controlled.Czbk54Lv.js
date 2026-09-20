const n=`<!-- 受控 | 传入 open 后由宿主决定；Escape、点击面板外、按关闭按钮都只回写 open，不自行修改状态 -->
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
<\/script>

<template>
  <XhDrawerRoot v-model:open="open" side="left" :translations="{ close: '关闭' }">
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton variant="solid" @click="open = true">打开左侧抽屉</XhButton>
      <span>当前：{{ open ? "展开" : "收起" }}</span>
    </div>
    <XhDrawerContent>
      <XhDrawerTitle>受控抽屉</XhDrawerTitle>
      <XhDrawerDescription>
        这里没有 trigger，开合完全跟着外面那颗按钮与 open 走。
      </XhDrawerDescription>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
`;export{n as default};
