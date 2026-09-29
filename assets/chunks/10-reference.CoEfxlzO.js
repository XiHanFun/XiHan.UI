const e=`<!-- 参考线 | reference 画一条横贯的虚线：写目标值看每天达没达标，写 mean / median 看高于还是低于平常；摘要一并读出它的值 -->
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 14 天的日销量（单），目标每天 180
const sales = [150, 162, 188, 171, 196, 214, 176, 182, 165, 158, 201, 194, 179, 186];
<\/script>

<template>
  <div style="display: grid; gap: 8px">
    <XhSparkline :data="sales" :reference="180" aria-label="近 14 天日销量，目标 180 单" />
    <!-- 均值由组件按有值的点算出 -->
    <XhSparkline :data="sales" reference="mean" variant="area" aria-label="近 14 天日销量与均值" />
  </div>
</template>
`;export{e as default};
