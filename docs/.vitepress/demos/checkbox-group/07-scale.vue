<!-- 整组换档 | 方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 一档尺寸就是一组令牌：方框边长、勾的字号、条目字号、条目内间距与条目间距
const compact =
  "--xh-checkbox-group-control-size: 13px; --xh-checkbox-group-control-font-size: 10px; --xh-checkbox-group-item-font-size: 13px; --xh-checkbox-group-item-gap: 6px; --xh-checkbox-group-gap: 8px";
const roomy =
  "--xh-checkbox-group-control-size: 20px; --xh-checkbox-group-control-font-size: 15px; --xh-checkbox-group-item-font-size: 17px; --xh-checkbox-group-item-gap: 10px; --xh-checkbox-group-gap: 14px";
// 选中态的底与描边各是一个令牌，两个一起换才不会只填色不换边
const green =
  "--xh-checkbox-group-control-bg-checked: #16a34a; --xh-checkbox-group-control-border-checked: #16a34a";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="compact" label="紧凑" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="缺省" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="roomy" label="宽松" />

    <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" :style="green" label="换选中色" />
  </div>
</template>
