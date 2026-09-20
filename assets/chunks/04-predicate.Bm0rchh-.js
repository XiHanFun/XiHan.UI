const e=`<!-- 逐格判定 | isTimeUnavailable 收到值、列与端，起点只能整点开始、终点只能半点结束 -->
<script setup lang="ts">
import type { TimePickerColumnUnit, TimeRangePickerEndIndex } from "@xihan-ui/headless";
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

const value = ref<string[]>([]);
const text = computed(() => (value.value[0] && value.value[1] ? \`\${value.value[0]} → \${value.value[1]}\` : "（未填齐）"));

// 判定与 min/max 的界外值同等对待：判真的格子仍可聚焦，只是选不中
function isTimeUnavailable(option: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex): boolean {
  if (unit !== "minute")
    return false;
  return index === 0 ? option !== "00" : option !== "30";
}
<\/script>

<template>
  <XhTimeRangePickerRoot v-model:value="value" :is-time-unavailable="isTimeUnavailable" :step="15">
    <XhTimeRangePickerLabel>课时</XhTimeRangePickerLabel>
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
