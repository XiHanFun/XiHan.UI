const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 逐段输入并实时获得标准时间值；有值时可以一键清空 -->
<script setup lang="ts">
import {
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
<\/script>

<template>
  <XhTimeFieldRoot v-model:value="value" name="start-time">
    <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
      <XhTimeFieldClearTrigger />
    </XhTimeFieldControl>
    <XhTimeFieldHiddenInput />
  </XhTimeFieldRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value || "（未填齐）" }}
  </span>
</template>
`;export{e as default};
