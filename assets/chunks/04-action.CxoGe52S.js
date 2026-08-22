const n=`<!-- 操作按钮 | action-trigger 按下时先发 action 事件，再让这条进入退场；closable 决定还要不要那颗叉 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const seq = ref(0);
const log = ref("（还没点）");

function onAction(details: { id: string }): void {
  log.value = \`撤销了：\${details.id}\`;
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      :key="seq"
      id="toast-demo-action"
      title="已删除 1 个文件"
      description="30 秒内可以撤销"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhToastTitle />
      <XhToastDescription />
      <div style="display: flex; align-items: center; gap: 8px">
        <XhToastActionTrigger>撤销</XhToastActionTrigger>
        <XhToastCloseTrigger />
      </div>
    </XhToastRoot>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
`;export{n as default};
