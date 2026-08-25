<!-- 手动收走 | create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationGroup,
  XhNotificationRoot,
  XhNotificationItem,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Dismiss = (id: string) => void;

const pending = ref("");
const itemTranslations = { close: "关闭" };

function start(create: Create): void {
  pending.value = create({
    type: "loading",
    title: "正在导出",
    description: "loading 不自动消失，等宿主来收",
  });
}

function finish(dismiss: Dismiss): void {
  if (!pending.value) {
    return;
  }
  dismiss(pending.value);
  pending.value = "";
}

// 用户自己按叉关掉时，记下的 id 也要作废
function settle(
  details: { id: string; status: string },
  dismiss: Dismiss
): void {
  if (details.status !== "unmounted") {
    return;
  }
  dismiss(details.id);
  if (details.id === pending.value) {
    pending.value = "";
  }
}
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss, count }">
    <XhButton variant="solid" :disabled="!!pending" @click="start(create)">
      开始导出
    </XhButton>
    <XhButton variant="outline" :disabled="!pending" @click="finish(dismiss)">
      手动收走
    </XhButton>
    <span>队列：{{ count }} 条 · 记下的 id：{{ pending || "（无）" }}</span>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :type="item.type"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="(details) => settle(details, dismiss)"
        >
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
