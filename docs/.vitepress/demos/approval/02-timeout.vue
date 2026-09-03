<!-- 超时按拒绝收口 | 缺省不给默认超时值：替宿主定安全策略比不定更危险。到点落成拒绝，expired 只是显示态 -->
<script setup lang="ts">
import type { ApprovalStatus } from "@xihan-ui/headless";
import {
  XhApprovalFooter,
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalTimer,
  XhApprovalTitle,
} from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const left = ref(10);
const decided = ref("");

const resultText = (status: ApprovalStatus) => {
  if (status === "approved") return "已批准";
  return status === "expired" ? "超时未答，按拒绝处理" : "已拒绝";
};

let timer = 0;
const tick = () => {
  left.value = Math.max(0, left.value - 1);
  if (left.value > 0) timer = window.setTimeout(tick, 1000);
};
// 倒计时挂载后才起：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(() => {
  timer = window.setTimeout(tick, 1000);
});

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhApprovalRoot
      v-slot="{ status }"
      :timeout-ms="10000"
      tone="danger"
      @decision="decided = `${$event.decision}（来源 ${$event.source}）`"
    >
      <XhApprovalTitle>要执行一条删除命令</XhApprovalTitle>
      <XhApprovalDescription>没人答的话，到点按拒绝处理。</XhApprovalDescription>
      <!-- 剩余时间对读屏隐藏：逐秒跳字进活区会不停打断 -->
      <XhApprovalTimer>还剩 {{ left }} 秒</XhApprovalTimer>
      <XhApprovalResult>{{ resultText(status) }}</XhApprovalResult>
      <XhApprovalFooter>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalFooter>
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
