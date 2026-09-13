<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 输入时间 -->
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldClearTrigger,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimeFieldRoot
    name="start-time"
    style="--xh-time-field-control-min-w: calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))"
  >
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
</template>
