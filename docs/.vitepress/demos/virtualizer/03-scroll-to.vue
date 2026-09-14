<!-- 滚到指定条目 | scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹住 -->
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 操作入口从根部件的插槽里取，滚动的活儿交给内核 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems, startIndex, scrollToIndex }"
    :count="2000"
    :estimate-size="32"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 8px">
      <button type="button" @click="scrollToIndex(0)">回到第 1 条</button>
      <button type="button" @click="scrollToIndex(500, { align: 'center' })">
        第 501 条居中
      </button>
      <button type="button" @click="scrollToIndex(9999, { align: 'end' })">末条贴底</button>
      <span>可视区首条：{{ startIndex ?? "—" }}</span>
    </div>

    <!-- 视口自带确定高度，root 就不必再定高 -->
    <XhVirtualizerViewport style="block-size: 220px">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="
            display: flex;
            align-items: center;
            height: 32px;
            padding-inline: 12px;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
