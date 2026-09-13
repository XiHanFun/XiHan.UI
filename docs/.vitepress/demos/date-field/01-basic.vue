<!-- 基础用法 | 输入日期 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldClearTrigger,
  XhDateFieldHiddenInput,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDateFieldRoot
    locale="zh-CN"
    name="deadline"
    style="--xh-date-field-control-min-w: calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))"
  >
    <XhDateFieldLabel>截止日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>/</span>
        <XhDateFieldSegment :index="1" />
        <span>/</span>
        <XhDateFieldSegment :index="2" />
      </XhDateFieldSegmentGroup>
      <XhDateFieldClearTrigger />
    </XhDateFieldControl>
    <XhDateFieldHiddenInput />
  </XhDateFieldRoot>
</template>
