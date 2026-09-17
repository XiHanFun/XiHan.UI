<script setup lang="ts">
import {
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNotificationItem
    id="preview"
    title="审批已到达"
    description="张三提交了一份请假单"
    tone="info"
    :duration="0"
    :translations="{ close: '关闭' }"
    style="inline-size: var(--xh-doc-catalog-w)"
  >
    <XhNotificationItemIndicator />
    <XhNotificationItemTitle />
    <XhNotificationItemDescription />
    <XhNotificationItemCloseTrigger />
  </XhNotificationItem>
</template>
