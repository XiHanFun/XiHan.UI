<!-- 基础用法 | 输入日期 -->
<script setup lang="ts">
import {
  XhDateFieldClearTrigger,
  XhDateFieldControl,
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
