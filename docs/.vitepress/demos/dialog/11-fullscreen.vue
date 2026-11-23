<!-- 全屏 | fullscreen 让面板铺满视口：头尾定在原处，正文吃掉剩下的高度；内容多到值得占满一屏时用，比如编辑一份长表单 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" fullscreen :translations="{ close: '关闭' }">
    <XhDialogTrigger>全屏编辑</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogHeader>
        <XhDialogTitle>编辑季度报表</XhDialogTitle>
      </XhDialogHeader>
      <XhDialogBody>
        <p>正文占满头尾之间的全部高度，内容超出时在这一段里滚动。</p>
      </XhDialogBody>
      <XhDialogFooter>
        <XhButton @click="setOpen(false)">取消</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">保存</XhButton>
      </XhDialogFooter>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
