<!-- 尺寸 | 三档换的是浮层的内边距与字号，不写 size 即缺省档；把指针停在触发器上（或用 Tab 聚焦）看差别 -->
<script setup lang="ts">
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhTooltipRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.value"
      placement="bottom"
      :open-delay="0"
    >
      <XhTooltipTrigger>{{ s.label }}</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          size = {{ s.value ?? "未指定" }}
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  </div>
</template>
