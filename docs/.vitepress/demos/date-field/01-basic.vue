<!-- 基础用法 | 三段各是一个可加减的数，整组只占一个 Tab 位，三段填齐才第一次报出值 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldHiddenInput,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";

const value = ref<string | null>(null);
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN" name="due">
    <XhDateFieldLabel>截止日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <!-- 段只声明下标，是年是月由 locale 算出；中间的「年 / 月 / 日」是普通节点 -->
      <XhDateFieldSegment :index="0" />
      <span>年</span>
      <XhDateFieldSegment :index="1" />
      <span>月</span>
      <XhDateFieldSegment :index="2" />
      <span>日</span>
    </XhDateFieldControl>
    <!-- 表单出口：值是 ISO 串，没填齐时它就是空的 -->
    <XhDateFieldHiddenInput />
  </XhDateFieldRoot>

  <span style="font-size: 13px">当前值：{{ value ?? "（未填齐）" }}</span>
</template>
