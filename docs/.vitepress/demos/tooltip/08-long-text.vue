<!-- 长文案 | 提示到了宽度上限就换行，不会拉成一条横线；上限是 content 上的 --xh-tooltip-max-w 槽位 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const text = "导出会把当前筛选条件下的全部行写进文件，行数很多时要等上一会儿。";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhTooltipRoot placement="bottom" :open-delay="0">
      <XhTooltipTrigger>缺省上限</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          {{ text }}
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>

    <XhTooltipRoot placement="bottom" :open-delay="0">
      <XhTooltipTrigger>放宽到 360px</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent style="--xh-tooltip-max-w: 360px">
          {{ text }}
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  </div>
</template>
