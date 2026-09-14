<script setup lang="ts">
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldRoot style="inline-size: 220px">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <XhFieldControl>
      <input type="email" placeholder="you@example.com">
    </XhFieldControl>
    <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
  </XhFieldRoot>
</template>
