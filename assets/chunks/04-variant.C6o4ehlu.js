const o=`<!-- 附着工具面 | 为悬浮工具条提供完整表面 -->
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhToolbarRoot variant="outline" aria-label="快捷操作">
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
      <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
      <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarItem value="more" type="button">更多</XhToolbarItem>
  </XhToolbarRoot>
</template>
`;export{o as default};
