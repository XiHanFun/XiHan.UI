const n=`<!-- 「其他」合并 | 扇区多于 maxSlices 时最小的几块并成「其他」，排在最后、取中性色，提示框里列出被合并的各项 -->
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// maxSlices 含「其他」那一块：这里保留 4 个省份加「其他」
const rows = [
  { province: "广东", orders: 3200 },
  { province: "浙江", orders: 2400 },
  { province: "江苏", orders: 2100 },
  { province: "山东", orders: 1300 },
  { province: "四川", orders: 800 },
  { province: "湖北", orders: 600 },
  { province: "福建", orders: 500 },
  { province: "河南", orders: 400 },
];
<\/script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="province"
    value-field="orders"
    :max-slices="5"
  >
    <template #caption>各省订单占比</template>
  </XhPieChartRoot>
</template>
`;export{n as default};
