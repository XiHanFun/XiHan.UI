<!-- 操作按钮 | action-trigger 按下时先发 action 事件，再使该条进入退场；closable 决定是否保留关闭按钮 -->
<script setup lang="ts">
import {
  XhButton,
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
const log = ref("（还没点）");

function onAction(details: { id: string }): void {
  log.value = `撤销了：${details.id}`;
}
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      id="toast-demo-action"
      :key="seq"
      title="已删除 1 个文件"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
      <XhToastActionTrigger>撤销</XhToastActionTrigger>
      <XhToastCloseTrigger />
    </XhToastRoot>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
