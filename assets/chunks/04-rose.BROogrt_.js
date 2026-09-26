const e=`<!-- 玫瑰图 | rose 让角度均分、半径按数值：面积与数值成正比，适合各项差距悬殊时拉开层次 -->
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// 季度有自然次序，sort="none" 按数据次序排，不按大小
const rows = [
  { quarter: "一季度", users: 120 },
  { quarter: "二季度", users: 210 },
  { quarter: "三季度", users: 340 },
  { quarter: "四季度", users: 460 },
];
<\/script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="quarter"
    value-field="users"
    rose
    sort="none"
  >
    <template #caption>各季度新增用户（千人）</template>
  </XhPieChartRoot>
</template>
`;export{e as default};
