<!-- 头尾固定、正文滚动 | header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚 -->
<script setup lang="ts">
import {
  XhButton,
  XhDrawerBody,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerFooter,
  XhDrawerHeader,
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
      <XhDrawerHeader>
        <XhDrawerTitle>操作记录</XhDrawerTitle>
        <XhDrawerDescription>共 {{ records.length }} 条，往下翻。</XhDrawerDescription>
      </XhDrawerHeader>
      <XhDrawerBody>
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
      </XhDrawerBody>
      <XhDrawerFooter>
        <XhButton variant="solid" @click="setOpen(false)">看完了</XhButton>
      </XhDrawerFooter>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
