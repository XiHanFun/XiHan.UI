<!-- 数据更新 | 换一组数据时扇区从当前角度走到新角度；关掉动画后直接画终态 -->
<script setup lang="ts">
import { XhButton, XhPieChartRoot, XhSwitch } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const channels = ["搜索", "直接访问", "社交", "邮件"];
const weeks = [
  { week: 1, visits: [4200, 2800, 1800, 1200] },
  { week: 2, visits: [3000, 3400, 2400, 1200] },
  { week: 3, visits: [3600, 2200, 3000, 1600] },
];

const index = ref(0);
const animated = ref(true);
const current = computed(() => weeks[index.value]!);
const rows = computed(() => channels.map((channel, i) => ({ channel, visits: current.value.visits[i] })));
</script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-4)', width: '100%' }">
    <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-4)' }">
      <XhButton @click="index = (index + 1) % weeks.length">
        换一组数据
      </XhButton>
      <label :style="{ display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' }">
        <XhSwitch v-model:checked="animated" />
        动画
      </label>
    </div>
    <!-- 按数据次序排列：扇区不随数值换位，只在原处伸缩 -->
    <XhPieChartRoot
      :data="rows"
      name-field="channel"
      value-field="visits"
      sort="none"
      :animated="animated"
    >
      <template #caption>
        第 {{ current.week }} 周访问来源
      </template>
    </XhPieChartRoot>
  </div>
</template>
