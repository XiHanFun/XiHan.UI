<!-- 头尾固定、正文滚动 | header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

const clauses = Array.from({ length: 16 }, (_, i) => `第 ${i + 1} 条 条款正文`);
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDialogTrigger>阅读服务条款</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogHeader>
        <XhDialogTitle>服务条款</XhDialogTitle>
        <XhDialogDescription>
          写了 body 那一段，面板自己封顶、正文自己滚，头尾不跟着走。
        </XhDialogDescription>
      </XhDialogHeader>
      <XhDialogBody>
        <p v-for="c in clauses" :key="c" style="margin: 0 0 8px">{{ c }}</p>
      </XhDialogBody>
      <XhDialogFooter>
        <XhButton variant="ghost" @click="setOpen(false)">再看看</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">同意</XhButton>
      </XhDialogFooter>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
