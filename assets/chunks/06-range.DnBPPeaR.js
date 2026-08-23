const e=`<!-- 可选时段 | min / max 直接把界外的格从列里裁掉；分列还会随已选的时再裁一遍 -->
<script setup lang="ts">
import { ref } from "vue";
import {
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
  <XhTimePickerRoot v-model:value="value" min="09:00" max="18:00" :step="30">
    <XhTimePickerLabel>面谈时段</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerInput segment="hour" />
        <span>:</span>
        <XhTimePickerInput segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 时列只剩 09 到 18；选到 18 时分列就只剩 00 -->
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">
    手打进段位的时间不受裁剪限制，越界只被标注：{{ value || "（空）" }}
  </span>
</template>
`;export{e as default};
