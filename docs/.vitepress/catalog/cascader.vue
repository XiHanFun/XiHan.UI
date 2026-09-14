<script setup lang="ts">
import { XhCascaderControl, XhCascaderIndicator, XhCascaderLabel, XhCascaderRoot, XhCascaderTrigger, XhCascaderValueText } from "@xihan-ui/vue";

const regions = [
  { value: "zhejiang", label: "浙江", children: [{ value: "hangzhou", label: "杭州", children: [{ value: "xihu", label: "西湖区" }] }] },
  { value: "jiangsu", label: "江苏", children: [{ value: "nanjing", label: "南京", children: [{ value: "xuanwu", label: "玄武区" }] }] },
];
</script>

<template>
  <XhCascaderRoot :collection="regions" :default-value="['zhejiang', 'hangzhou', 'xihu']" style="inline-size: 220px">
    <XhCascaderLabel>收货地区</XhCascaderLabel>
    <XhCascaderControl>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
      </XhCascaderTrigger>
    </XhCascaderControl>
  </XhCascaderRoot>
</template>
