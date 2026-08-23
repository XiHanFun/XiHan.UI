const e=`<!-- 精度到秒 | granularity 同时决定输入行显示几段、浮层里排几列 -->
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

const value = ref("");
<\/script>

<template>
  <XhTimePickerRoot v-model:value="value" granularity="second">
    <XhTimePickerLabel>执行时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerInput segment="hour" />
        <span>:</span>
        <XhTimePickerInput segment="minute" />
        <span>:</span>
        <XhTimePickerInput segment="second" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="second">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
`;export{e as default};
