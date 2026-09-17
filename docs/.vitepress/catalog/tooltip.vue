<script setup lang="ts">
import { XhTooltipContent, XhTooltipRoot, XhTooltipTrigger } from "@xihan-ui/vue";
</script>

<template>
  <!-- 展示已打开的静态提示：不包 Positioner，content 就地渲染在触发器下方 -->
  <div style="display: grid; gap: var(--xh-space-2); justify-items: center">
    <XhTooltipRoot default-open>
      <XhTooltipTrigger>保存</XhTooltipTrigger>
      <XhTooltipContent>写入草稿箱，不会发布</XhTooltipContent>
    </XhTooltipRoot>
  </div>
</template>
