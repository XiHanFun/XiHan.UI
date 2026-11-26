<!-- props 写法 | 不写结构时按标准结构铺：标题与说明两个属性写出一块空状态，图标与操作用同名插槽 -->
<script setup lang="ts">
import { XhButton, XhEmptyStateRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot
    title="还没有任何工单"
    description="新建一条工单，或者换个筛选条件再看看。"
    style="inline-size: 100%"
  >
    <template #indicator>∅</template>
    <template #action>
      <XhButton variant="solid">新建工单</XhButton>
    </template>
  </XhEmptyStateRoot>
</template>
