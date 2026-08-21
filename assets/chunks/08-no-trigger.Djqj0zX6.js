const e=`<!-- 只用输入框 | 加减钮是可选部件，不渲染它照样能改值：方向键走 step，PageUp 与 PageDown 走 largeStep -->
<script setup lang="ts">
import { XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/vue";
<\/script>

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
    <XhNumberFieldInput style="inline-size: 96px; text-align: center" />
    <span>点进框里按上下键：{{ value === "" ? "（空）" : value }}</span>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
