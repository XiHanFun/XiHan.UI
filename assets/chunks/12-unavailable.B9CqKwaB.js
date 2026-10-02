const e=`<!-- 按已选的时判定 | isTimeUnavailable 的第三个参数带已选的时：9 点只能约 30 分以后，别的整点不受限 -->
<script setup lang="ts">
import type { TimeColumnUnit, TimeUnavailableContext } from "@xihan-ui/headless";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["09:30"]);

// 判真的格子仍在列里、仍可聚焦，只是选不中；时列的值恒按 24 小时制给
function isTimeUnavailable(option: string, unit: TimeColumnUnit, context: TimeUnavailableContext): boolean {
  return unit === "minute" && context.hour === 9 && Number(option) < 30;
}
<\/script>

<template>
  <XhTimePickerRoot
    v-model:value="value"
    min="09:00"
    max="18:00"
    :time-step="{ minute: 15 }"
    :is-time-unavailable="isTimeUnavailable"
  >
    <XhTimePickerLabel>到店时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（空）" }}</span>
</template>
`;export{e as default};
