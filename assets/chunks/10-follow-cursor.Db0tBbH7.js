var e=`<!-- 跟随鼠标 | followCursor 让提示锚在指针落点上并随移动更新；触屏与键盘聚焦时仍锚在触发器上 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhTooltipRoot follow-cursor :open-delay="0">
    <XhTooltipTrigger style="inline-size: 100%; block-size: 96px">在这块区域里移动指针</XhTooltipTrigger>
    <XhTooltipPositioner>
      <XhTooltipContent>
        提示跟着指针走
        <XhTooltipArrow />
      </XhTooltipContent>
    </XhTooltipPositioner>
  </XhTooltipRoot>
</template>
`;export{e as default};