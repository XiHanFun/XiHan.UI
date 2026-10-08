var e=`<!-- 操作按钮 | item-action-trigger 按下时先发 action 事件，再使该条进入退场；破坏性操作配“撤销”优于事前确认 -->
<script setup lang="ts">
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
const log = ref("（还没点）");

function onAction(details: { id: string }): void {
  log.value = \`撤销了：\${details.id}\`;
}
<\/script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhNotificationItem
      id="notification-demo-action"
      :key="seq"
      preset="toast"
      title="已删除 1 个文件"
      :duration="0"
      :translations="{ close: '关闭' }"
      @action="onAction"
    >
      <XhNotificationItemIndicator />
      <XhNotificationItemContent><XhNotificationItemTitle /></XhNotificationItemContent>
      <XhNotificationItemActionTrigger>撤销</XhNotificationItemActionTrigger>
      <XhNotificationItemCloseTrigger />
    </XhNotificationItem>
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" variant="outline" @click="seq++">再挂一条</XhButton>
      <span>{{ log }}</span>
    </div>
  </div>
</template>
`;export{e as default};