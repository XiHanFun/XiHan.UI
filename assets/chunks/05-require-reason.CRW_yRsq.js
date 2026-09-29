const e=`<!-- 拒绝要写理由 | requireReason 让用户拒绝时必须写明理由：备注空着就按拒绝或 Escape，焦点落到备注框并标为无效，写上理由再按才拒绝；超时照常按拒绝收口 -->
<script setup lang="ts">
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalNote,
  XhApprovalRoot,
  XhApprovalTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const decided = ref("");

const translations = { reason: "拒绝理由（必填）", notePlaceholder: "说明为什么不让它做" };
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhApprovalRoot
      require-reason
      :translations="translations"
      @decision="decided = \`\${$event.decision}（理由 \${$event.note ?? '无'}）\`"
    >
      <XhApprovalTitle>要删除远端分支 release/2.1</XhApprovalTitle>
      <XhApprovalDescription>拒绝时写一句理由，Agent 会据此换个做法。</XhApprovalDescription>
      <XhApprovalNote />
      <XhApprovalFooter>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalFooter>
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
`;export{e as default};
