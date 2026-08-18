<!-- 基础用法 | 不传 open 即为非受控；Esc 或点遮罩关闭，关闭后焦点回到触发按钮 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDialogTrigger>打开对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>确认发布</XhDialogTitle>
      <XhDialogDescription>
        发布后这篇文档对所有人可见，之后仍可撤回。
      </XhDialogDescription>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <XhButton variant="ghost" @click="setOpen(false)">取消</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">发布</XhButton>
      </div>
      <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
