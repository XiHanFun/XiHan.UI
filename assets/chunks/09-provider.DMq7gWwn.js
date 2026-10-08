var e=`<!-- 提示组 | XhTooltipProvider 把一排提示放进同一组：没写延时的取组的缺省，组里另一个开着时指向下一个直接接替，同一时刻只开一个 -->
<script setup lang="ts">
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipProvider,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const tools = [
  { label: "加粗", tip: "加粗（Ctrl+B）" },
  { label: "斜体", tip: "斜体（Ctrl+I）" },
  { label: "下划线", tip: "下划线（Ctrl+U）" },
];
<\/script>

<template>
  <XhTooltipProvider :open-delay="400" :skip-delay-duration="500">
    <div style="display: flex; gap: 8px">
      <XhTooltipRoot v-for="tool in tools" :key="tool.label">
        <XhTooltipTrigger>{{ tool.label }}</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>{{ tool.tip }}</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>
  </XhTooltipProvider>
</template>
`;export{e as default};