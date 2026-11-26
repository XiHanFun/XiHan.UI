<!-- props 写法 | 不写结构时按标准结构铺：触发器文字与提示文字两个属性写出一条提示，箭头随结构一并铺上 -->
<script setup lang="ts">
import { XhTooltipRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTooltipRoot trigger-text="保存" content="写入草稿箱，不会发布" />
</template>
