<!-- 手动收走 | create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToasterGroup,
  XhToasterRoot,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Dismiss = (id: string) => void;

const pending = ref("");
const toastTranslations = { close: "关闭" };

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
  <XhToasterRoot v-slot="{ create, dismiss, count }">
    <XhButton variant="solid" :disabled="!!pending" @click="start(create)">
      开始导出
    </XhButton>
    <XhButton variant="outline" :disabled="!pending" @click="finish(dismiss)">
      手动收走
    </XhButton>
    <span>队列：{{ count }} 条 · 记下的 id：{{ pending || "（无）" }}</span>

    <XhToasterGroup>
      <template #default="{ toast }">
        <XhToastRoot
          :id="toast.id"
          :title="toast.title"
          :description="toast.description"
          :type="toast.type"
          :duration="toast.duration"
          :remove-delay="toast.removeDelay"
          :closable="toast.closable"
          :translations="toastTranslations"
          @status-change="(details) => settle(details, dismiss)"
        >
          <XhToastTitle />
          <XhToastDescription />
          <XhToastCloseTrigger />
        </XhToastRoot>
      </template>
    </XhToasterGroup>
  </XhToasterRoot>
</template>
