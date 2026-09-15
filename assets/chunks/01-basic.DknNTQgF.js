const o=`<!-- 基础用法 | 点击展开，Escape 或点外部关闭；positioner 负责摆位，content 才是浮层本体 -->
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhPopoverRoot placement="bottom-start" :translations="{ close: '关闭' }">
    <XhPopoverTrigger>订阅设置</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhPopoverTitle>订阅设置</XhPopoverTitle>
        <XhPopoverDescription>
          role=dialog，触发器与内容四处 ARIA 互指；非模态，焦点不被陷住。
        </XhPopoverDescription>
        <XhPopoverCloseTrigger />
        <XhPopoverArrow />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
`;export{o as default};
