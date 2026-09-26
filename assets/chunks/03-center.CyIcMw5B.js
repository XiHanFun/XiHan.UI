const t=`<!-- 自定义中心 | center 插槽替换环形中心的缺省合计：这里写出结论，而不是再放一个数字 -->
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

const tasks = [
  { status: "已完成", count: 72 },
  { status: "进行中", count: 18 },
  { status: "未开始", count: 10 },
];

// 中心写的是「完成了多少」，读者不用自己去加
const done = Math.round((tasks[0]!.count / tasks.reduce((sum, t) => sum + t.count, 0)) * 100);
<\/script>

<template>
  <XhPieChartRoot :data="tasks" name-field="status" value-field="count" sort="none">
    <template #caption>本迭代任务</template>
    <template #center>
      <span :style="{ fontSize: 'var(--xh-text-heading-3-size)', fontWeight: 'var(--xh-font-weight-semibold)' }">{{ done }}%</span>
      <span :style="{ color: 'var(--xh-fg-muted)', fontSize: 'var(--xh-text-secondary-size)' }">已完成</span>
    </template>
  </XhPieChartRoot>
</template>
`;export{t as default};
