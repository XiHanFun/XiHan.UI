<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 time-field 相关实现。 -->

<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimeFieldRoot default-value="09:30">
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>
</template>
