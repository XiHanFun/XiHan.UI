var e=`<!-- 可拖动 | draggable 让标题栏成为拖动区，面板始终夹在视口内；标题栏里的拖动把手让键盘也能挪：方向键挪一步，Enter 回到居中 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogDragTrigger,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" draggable :translations="{ close: '关闭', dragTrigger: '移动对话框' }">
    <XhDialogTrigger>打开可拖动的对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogHeader>
        <XhDialogDragTrigger />
        <XhDialogTitle>拖住标题栏挪窗口</XhDialogTitle>
        <XhDialogDescription>每次打开都从正中开始；拖出视口的那一截会被夹回来。</XhDialogDescription>
      </XhDialogHeader>
      <div style="display: flex; justify-content: flex-end">
        <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      </div>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{e as default};