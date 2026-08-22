<!-- 分列步长 | step=15 只裁浮层里的可选值（分列剩四格），段位上手打的分数不受它限制 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerSegmentGroup,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const value = ref("09:30");
</script>

<template>
  <XhTimePickerRoot v-model:value="value" :step="15">
    <XhTimePickerLabel>预约时段</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerInput segment="hour" />
        <span>:</span>
        <XhTimePickerInput segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 时列 24 格装不下，方向键走到列尾它自己滚起来，滚的是那一列不是整个面板 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
