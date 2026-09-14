<!-- 基础用法 | 起止两组输入框与两组选择面板共享同一份值；按 15 分钟列出选项并实时显示结果 -->
<script setup lang="ts">
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerHiddenInput,
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

const value = ref<string[]>(["09:00", "18:00"]);
// 值恒为两端：只填了终点时是 ['', end]
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));
</script>

<template>
  <XhTimeRangePickerRoot
    v-model:value="value"
    name="open-at"
    end-name="close-at"
    :step="15"
  >
    <XhTimeRangePickerLabel>营业时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <!-- 端号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <!-- 两份表单出口：0 是起点，1 是终点 -->
    <XhTimeRangePickerHiddenInput :index="0" />
    <XhTimeRangePickerHiddenInput :index="1" />
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
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
