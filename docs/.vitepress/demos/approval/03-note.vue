<!-- 附一句备注 | 备注与勾选同批取快照，随判定载荷一起发出；空着就不带这一格，它不参与「必选项勾满了没有」的判断 -->
<script setup lang="ts">
import {
  XhApprovalFooter,
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalNote,
  XhApprovalRoot,
  XhApprovalTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const decided = ref("");

const translations = { notePlaceholder: "补充一句（可不填）", note: "备注" };
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhApprovalRoot
      :translations="translations"
      @decision="decided = `${$event.decision}（备注 ${$event.note ?? '无'}）`"
    >
      <XhApprovalTitle>要把这批改动推上去</XhApprovalTitle>
      <XhApprovalDescription>推之前可以留一句话，随判定一起交给宿主。</XhApprovalDescription>
      <XhApprovalNote />
      <XhApprovalFooter>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalFooter>
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
