<!-- 形态 | variant 决定底色与描边的绘制方式：描边、淡色填底、无框；密码框没有实心档 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <XhPasswordInputRoot v-for="v in variants" :key="v" :variant="v" default-value="hunter2">
    <XhPasswordInputLabel>{{ v }}</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
