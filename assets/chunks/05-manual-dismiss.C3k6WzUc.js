const n=`<!-- 手动关闭 | create 返回的就是队列身份 id，保存后可随时 dismiss 该条；dismiss 直接移出队列，不播退场动画 -->
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

type Create = (options: Record<string, unknown>) => string;
type Dismiss = (id: string) => void;

const pending = ref("");
const itemTranslations = { close: "关闭" };

function start(create: Create): void {
  pending.value = create({
    loading: true,
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
  dismiss: Dismiss,
): void {
  if (details.status !== "unmounted") {
    return;
  }
  dismiss(details.id);
  if (details.id === pending.value) {
    pending.value = "";
  }
}
<\/script>

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
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="(details) => settle(details, dismiss)"
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
`;export{n as default};
