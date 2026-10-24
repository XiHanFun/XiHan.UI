<!-- 基础用法 | 搜索并选择城市：filter="contains" 按打的字筛候选，不必自己写过滤；选中后再展开看到全部城市 -->
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];
</script>

<template>
  <XhComboboxRoot
    :collection="cities"
    filter="contains"
    clearable
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="搜索城市"
  />
</template>
