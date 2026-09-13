const o=`<!-- 垂直布局 | 按纵向排列工具 -->
<script setup lang="ts">
import { MaximizeIcon, ZoomInIcon, ZoomOutIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhToolbarRoot orientation="vertical" aria-label="画布缩放">
    <XhToolbarItem value="zoom-in" type="button"><XhIcon :icon="ZoomInIcon" />放大</XhToolbarItem>
    <XhToolbarItem value="zoom-out" type="button"><XhIcon :icon="ZoomOutIcon" />缩小</XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarItem value="fit" type="button"><XhIcon :icon="MaximizeIcon" />适应画布</XhToolbarItem>
  </XhToolbarRoot>
</template>
`;export{o as default};
