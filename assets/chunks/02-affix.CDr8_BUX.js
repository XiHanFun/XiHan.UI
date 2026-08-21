const t=`<!-- 前后缀 | prefix 与 suffix 和数值排在同一行、按基线对齐，比数值小一档 -->
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticPrefix,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 40px">
    <XhStatisticRoot>
      <XhStatisticLabel>账户余额</XhStatisticLabel>
      <XhStatisticPrefix>¥</XhStatisticPrefix>
      <XhStatisticValue>3,240.00</XhStatisticValue>
    </XhStatisticRoot>

    <XhStatisticRoot>
      <XhStatisticLabel>转化率</XhStatisticLabel>
      <XhStatisticValue>68.4</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>

    <XhStatisticRoot>
      <XhStatisticLabel>较上月</XhStatisticLabel>
      <XhStatisticPrefix>↑</XhStatisticPrefix>
      <XhStatisticValue>12.5</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
`;export{t as default};
