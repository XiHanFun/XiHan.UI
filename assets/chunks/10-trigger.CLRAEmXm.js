const e=`<!-- 可选的触发钮 | 点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerSegmentGroup,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";

const value = ref("09:30");
<\/script>

<template>
  <XhTimePickerRoot v-model:value="value">
    <XhTimePickerLabel>会议开始</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerInput segment="hour" />
        <span>:</span>
        <XhTimePickerInput segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerClearTrigger />
      <!-- 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
           键盘则在段上按 Alt+ArrowDown -->
      <XhTimePickerTrigger aria-label="展开时间列" />
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

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
`;export{e as default};
