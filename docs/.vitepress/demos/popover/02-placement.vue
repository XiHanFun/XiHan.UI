<!-- 朝向与间距 | placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离 -->
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const cases = [
  { placement: "top", offset: 8, label: "上方" },
  { placement: "right", offset: 8, label: "右侧" },
  { placement: "bottom-end", offset: 16, label: "下方靠尾（间距 16）" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopoverRoot
      v-for="c in cases"
      :key="c.placement"
      :placement="c.placement"
      :offset="c.offset"
    >
      <XhPopoverTrigger>{{ c.label }}</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverDescription>
            请求的朝向是 {{ c.placement }}。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
