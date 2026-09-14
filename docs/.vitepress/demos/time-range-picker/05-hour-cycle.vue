<!-- 十二小时制 | hourCycle 决定两组段位与时列的写法，上下午各成一段一列 -->
<script setup lang="ts">
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>(["09:00", "17:30"]);
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));
</script>

<template>
  <XhTimeRangePickerRoot v-model:value="value" :hour-cycle="12" locale="zh-CN" :step="30">
    <XhTimeRangePickerLabel>值班时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <XhTimeRangePickerSegmentGroup v-for="end in [0, 1]" :key="end" :index="end">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
        <XhTimeRangePickerSegment segment="dayPeriod" />
        <XhTimeRangePickerRangeSeparator v-if="end === 0" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="dayPeriod">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
