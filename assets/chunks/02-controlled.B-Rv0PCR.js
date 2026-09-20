const n=`<!-- 受控 | 传入 open 后由宿主决定，组件自身不再修改状态；Esc、点击遮罩、按关闭按钮都只回写 open -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhButton variant="solid" @click="open = true">打开</XhButton>
    <span>当前：{{ open ? "展开" : "收起" }}</span>
  </div>

  <XhDialogRoot v-model:open="open" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>受控对话框</XhDialogTitle>
      <XhDialogDescription>
        这里没有 trigger，开合完全由外面那颗按钮与 open 决定。
      </XhDialogDescription>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{n as default};
