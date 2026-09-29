const t=`<!-- 跨行 | row-span 让一格占几条行轨道，常用来放一块比同行其余格子更高的主内容 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhGridRoot :cols="3" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem :row-span="2" data-demo-block data-tone="brand" style="--xh-demo-block-block-size: auto" />
    <XhGridItem data-demo-block data-tone="info" />
    <XhGridItem data-demo-block data-tone="success" />
    <XhGridItem data-demo-block data-tone="warning" />
    <XhGridItem data-demo-block data-tone="danger" />
  </XhGridRoot>
</template>
`;export{t as default};
