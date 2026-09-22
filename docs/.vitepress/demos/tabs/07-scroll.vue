<!-- 放不下时滚动 | 标签带只裁主轴，两端翻页钮与滚轮把被裁掉的标签挪进视野 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsNextTrigger,
  XhTabsPrevTrigger,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const regions = [
  "华北",
  "华东",
  "华南",
  "华中",
  "西南",
  "西北",
  "东北",
  "港澳台",
  "海外",
];
</script>

<template>
  <XhTabsRoot default-value="华北" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="销售区域">
      <XhTabsPrevTrigger />
      <XhTabsTrigger v-for="region in regions" :key="region" :value="region">{{ region }}大区</XhTabsTrigger>
      <XhTabsIndicator />
      <XhTabsNextTrigger />
    </XhTabsList>

    <XhTabsContent v-for="region in regions" :key="region" :value="region">{{ region }}大区的销售概览。</XhTabsContent>
  </XhTabsRoot>
</template>
