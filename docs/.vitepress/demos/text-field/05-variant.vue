<!-- 形态 | variant 决定底与描边怎么画：描边、淡色填底、无框；输入框没有实心档 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <!-- 无框档平时只看得见字，把指针移上去或聚焦才浮出边界 -->
  <XhTextFieldRoot
    v-for="v in variants"
    :key="v"
    :variant="v"
    placeholder="请输入内容"
  >
    <XhTextFieldLabel>{{ v }}</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 180px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
