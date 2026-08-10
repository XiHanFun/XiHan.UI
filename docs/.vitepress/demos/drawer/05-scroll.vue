<!-- 内容滚动 | 面板本身定高，把中间那段设成可伸缩并开滚动，标题与底部操作就钉在两头 -->
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

const records = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  text: `第 ${i + 1} 条操作记录`,
}));
</script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>查看操作记录</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>操作记录</XhDrawerTitle>
      <XhDrawerDescription>共 {{ records.length }} 条，往下翻。</XhDrawerDescription>
      <div style="flex: 1; min-block-size: 0; overflow: auto">
        <p
          v-for="r in records"
          :key="r.id"
          style="
            margin: 0;
            padding: 8px 0;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          {{ r.text }}
        </p>
      </div>
      <XhButton variant="solid" @click="setOpen(false)">看完了</XhButton>
      <XhDrawerCloseTrigger>✕</XhDrawerCloseTrigger>
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
