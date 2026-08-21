<!-- 可关闭 | closable 开启后才渲染关闭按钮；open 受控时由宿主决定去留 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAlertCloseTrigger,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/vue";

const open = ref(true);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot v-model:open="open" closable>
      <XhAlertTitle>点右侧关闭</XhAlertTitle>
      <XhAlertCloseTrigger />
    </XhAlertRoot>
    <XhButton v-if="!open" size="sm" @click="open = true">再显示一次</XhButton>
  </div>
</template>
