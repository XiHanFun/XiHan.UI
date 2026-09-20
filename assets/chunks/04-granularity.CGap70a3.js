const e=`<!-- 按周选择 | granularity=week：一行一个整周，格子直接铺进网格；值是两端两周的周首日；月、季度与年同理 -->
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? \`\${value.value[0]} → \${value.value[1]}\` : "（未选）"));
<\/script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ periods }"
    v-model:value="value"
    locale="zh-CN"
    granularity="week"
    style="max-inline-size: 280px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <XhCalendarRangePickerHeading />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <!-- 周期视图没有周行那一层：一格就是一整周，格子直接铺进网格 -->
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerCell v-for="period in periods" :key="period.key" :value="period.start">
        <XhCalendarRangePickerCellTrigger>{{ period.label }}</XhCalendarRangePickerCellTrigger>
      </XhCalendarRangePickerCell>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">周区间：{{ text }}</span>
</template>
`;export{e as default};
