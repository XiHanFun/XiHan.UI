var e=`<!-- 计时与暂停 | duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放 -->
<script setup lang="ts">
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const seq = ref(0);
const board = ref<HTMLElement | null>(null);
const readout = ref("");
let watcher: MutationObserver | undefined;

// 生命周期与暂停态都写在卡片上（data-state / data-paused），照它回显
function paint(): void {
  const item = board.value?.querySelector<HTMLElement>("[data-scope='notification'][data-part='item']");
  readout.value = item
    ? \`状态：\${item.dataset.state ?? ""} · \${item.hasAttribute("data-paused") ? "计时已按住" : "计时在走"}\`
    : "";
}

onMounted(() => {
  if (!board.value)
    return;
  // 重新计时会换一张卡片，子树与属性一起盯
  watcher = new MutationObserver(paint);
  watcher.observe(board.value, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-state", "data-paused"],
  });
  paint();
});

onBeforeUnmount(() => watcher?.disconnect());
<\/script>

<template>
  <div ref="board" style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhNotificationItem
      :key="seq"
      preset="toast"
      title="6 秒后自动收走"
      :duration="6000"
      :translations="{ close: '关闭' }"
    >
      <XhNotificationItemIndicator />
      <XhNotificationItemContent>
        <XhNotificationItemTitle />
      </XhNotificationItemContent>
      <XhNotificationItemCloseTrigger />
    </XhNotificationItem>
    <XhButton size="sm" variant="outline" @click="seq++">重新计时</XhButton>
  </div>
  <span data-demo-output>{{ readout }}</span>
</template>
`;export{e as default};