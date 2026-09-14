<!-- 朝向 | placement 是请求值，空间不够时由定位引擎避让；箭头跟着最终落定的那一面走 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const placements = [
  { value: "top", label: "上方" },
  { value: "right", label: "右侧" },
  { value: "bottom", label: "下方" },
  { value: "left", label: "左侧" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhTooltipRoot
      v-for="p in placements"
      :key="p.value"
      :placement="p.value"
      :open-delay="0"
    >
      <XhTooltipTrigger>{{ p.label }}</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          请求朝向 {{ p.value }}
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  </div>
</template>
