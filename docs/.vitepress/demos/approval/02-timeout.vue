<!-- 超时按拒绝收口 | 缺省不给默认超时值：替宿主定安全策略比不定更危险。到点落成拒绝，expired 只是显示态 -->
<script setup lang="ts">
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalRoot,
  XhApprovalTimer,
  XhApprovalTitle,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const left = ref(10);
const decided = ref("");

let timer = 0;
const tick = () => {
  left.value = Math.max(0, left.value - 1);
  if (left.value > 0) timer = window.setTimeout(tick, 1000);
};
timer = window.setTimeout(tick, 1000);

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhApprovalRoot
      :timeout-ms="10000"
      tone="danger"
      @decision="decided = `${$event.decision}（来源 ${$event.source}）`"
    >
      <XhApprovalTitle>要执行一条删除命令</XhApprovalTitle>
      <XhApprovalDescription>没人答的话，到点按拒绝处理。</XhApprovalDescription>
      <!-- 剩余时间对读屏隐藏：逐秒跳字进活区会不停打断 -->
      <XhApprovalTimer>还剩 {{ left }} 秒</XhApprovalTimer>
      <div style="display: flex; gap: 8px;">
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </div>
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
