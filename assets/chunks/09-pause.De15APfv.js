const t=`<!-- 计时与暂停 | duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放 -->
<script setup lang="ts">
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
<\/script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhNotificationItem
      :key="seq"
      v-slot="{ item }"
      preset="toast"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhNotificationItemIndicator />
      <XhNotificationItemContent>
        <XhNotificationItemTitle />
        <span style="font-size: 12px; opacity: 0.75">
          状态：{{ item.status }} · {{ item.paused ? "计时已按住" : "计时在走" }}
        </span>
      </XhNotificationItemContent>
      <XhNotificationItemCloseTrigger />
    </XhNotificationItem>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
</template>
`;export{t as default};
