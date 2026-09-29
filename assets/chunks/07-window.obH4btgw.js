const n=`<!-- 随整页滚动 | scrollContainer 设为 window：列表铺在页面里，不另开滚动框，列表上方的内容不必再算 scrollMargin -->
<script setup lang="ts">
import {
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
<\/script>

<template>
  <!-- root 不定高：视口随内容撑开，滚的是整页 -->
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="200"
    :estimate-size="36"
    scroll-container="window"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <XhVirtualizerViewport>
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          style="display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>
`;export{n as default};
