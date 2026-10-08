var e=`<!-- 按单位步长 | timeStep 给时、分、秒各设步长，{ minute: 15 } 只裁剪浮层中的可选值（分列剩四格），段位上手动输入的分钟数不受它限制 -->
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
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
<\/script>

<template>
  <XhTimePickerRoot v-model:value="value" :time-step="{ minute: 15 }">
    <XhTimePickerLabel>预约时段</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
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

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（空）" }}</span>
</template>
`;export{e as default};