<!-- 只用输入框 | control 仍是必需的输入壳；加减钮可以省略，键盘仍按 step 与 largeStep 改值 -->
<script setup lang="ts">
import { XhNumberFieldControl, XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot
    v-slot="{ value }"
    default-value="60"
    :min="0"
    :max="100"
    :step="5"
    :large-step="25"
  >
    <XhNumberFieldLabel>音量（0 – 100，每档 5）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput style="inline-size: 96px; text-align: center" />
    </XhNumberFieldControl>
    <span>点进框里按上下键：{{ value === "" ? "（空）" : value }}</span>
  </XhNumberFieldRoot>
</template>
