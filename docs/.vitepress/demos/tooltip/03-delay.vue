<!-- 延时 | openDelay 默认 700ms 用来防误触，closeDelay 默认 300ms 留出指针走位的余地；聚焦不走这两段等待 -->
<script setup lang="ts">
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhTooltipRoot>
      <XhTooltipTrigger>默认（700 / 300）</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>停够 700ms 才出来</XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>

    <XhTooltipRoot :open-delay="0" :close-delay="0">
      <XhTooltipTrigger>无延时</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>指针一进就出，一走就收</XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>

    <XhTooltipRoot :open-delay="1500">
      <XhTooltipTrigger>慢一点（1500）</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>用 Tab 聚焦它，立刻就出来</XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  </div>
</template>
