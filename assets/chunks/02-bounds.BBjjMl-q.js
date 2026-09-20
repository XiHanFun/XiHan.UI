const e=`<!-- 可选时段 | min/max 与另一端边界把界外格标为禁用，两组列的结构与滚动位置保持稳定 -->
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

const value = ref<string[]>(["10:00", ""]);
const text = computed(() => (value.value[0] && value.value[1] ? \`\${value.value[0]} → \${value.value[1]}\` : "（未填齐）"));
<\/script>

<template>
  <XhTimeRangePickerRoot
    v-model:value="value"
    min="08:00"
    max="20:00"
    :step="30"
  >
    <XhTimeRangePickerLabel>预约时段</XhTimeRangePickerLabel>
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
`;export{e as default};
