<!-- 上限与清空 | max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不播退场动画 -->
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const seq = ref(0);
const itemTranslations = { close: "关闭" };

function nextTitle(): string {
  seq.value += 1;
  return `第 ${seq.value} 条通知`;
}
</script>

<template>
  <XhNotificationRoot
    v-slot="{ create, dismiss, dismissAll, count }"
    :max="3"
    :gap="12"
    :duration="20000"
  >
    <XhButton
      variant="solid"
      @click="create({ title: nextTitle(), description: '连按几下看最旧的被挤掉' })"
    >
      连着弹
    </XhButton>
    <XhButton variant="ghost" @click="dismissAll()">全部清空</XhButton>
    <span>队列：{{ count }} 条（上限 3）</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
