const t=`<!-- 基础用法 | 标签在上、数值在下；数值由使用者格式化后放入，组件不做千分位也不做换算 -->
<script setup lang="ts">
import { XhStatisticLabel, XhStatisticRoot, XhStatisticValue } from "@xihan-ui/vue";
<\/script>

<template>
  <XhStatisticRoot>
    <XhStatisticLabel>本月新增用户</XhStatisticLabel>
    <XhStatisticValue>12,480</XhStatisticValue>
  </XhStatisticRoot>
</template>
`;export{t as default};
