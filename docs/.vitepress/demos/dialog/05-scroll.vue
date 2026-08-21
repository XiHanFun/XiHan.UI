<!-- 内容滚动 | 标题与底部操作留在原处，只有中间那块长文在自己的框里滚 -->
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

const clauses = Array.from({ length: 16 }, (_, i) => `第 ${i + 1} 条 条款正文`);
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDialogTrigger>阅读服务条款</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>服务条款</XhDialogTitle>
      <XhDialogDescription>
        content 是纵向排布的，给中间这块限高并开滚动，头尾就不跟着走。
      </XhDialogDescription>
      <div
        style="
          max-block-size: 180px;
          overflow: auto;
          padding: 8px 12px;
          border: 1px solid var(--xh-border-subtle);
          border-radius: 8px;
        "
      >
        <p v-for="c in clauses" :key="c" style="margin: 0 0 8px">{{ c }}</p>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <XhButton variant="ghost" @click="setOpen(false)">再看看</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">同意</XhButton>
      </div>
      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
