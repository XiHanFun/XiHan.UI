<!-- 基础用法 | 勾选与判定是原子的：批准的载荷带着批准的项，不存在已批准但范围尚未同步的窗口 -->
<script setup lang="ts">
import type { ApprovalScope } from "@xihan-ui/headless";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalLiveRegion,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalStatusIndicator,
  XhApprovalTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const scopes: ApprovalScope[] = [
  { value: "read", label: "读取 src/ 下的文件", required: true },
  { value: "write", label: "写回改动" },
];

const decided = ref("");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <!-- 必选项没勾满就批不了；拒绝这条路不受它影响 -->
    <XhApprovalRoot
      v-slot="{ status }"
      :scopes="scopes"
      tone="warning"
      @decision="decided = `${$event.decision}（来源 ${$event.source}，范围 ${$event.scopes.join('、') || '无'}）`"
    >
      <!-- 待决时右上角的呼吸点，判过即收 -->
      <XhApprovalStatusIndicator />
      <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
      <XhApprovalDescription>它想读一遍 src/ 并写回改动。</XhApprovalDescription>
      <XhApprovalGroup>
        <XhApprovalItem
          v-for="scope in scopes"
          :key="scope.value"
          :scope-value="scope.value"
          :scope-label="scope.label"
          :scope-required="scope.required"
        >
          <!-- 勾由皮肤画：指示符留空即可，不必手打记号 -->
          <XhApprovalItemIndicator :scope-value="scope.value" />
          <XhApprovalItemText :scope-value="scope.value">{{ scope.label }}</XhApprovalItemText>
        </XhApprovalItem>
      </XhApprovalGroup>
      <XhApprovalResult>{{ status === "approved" ? "已批准" : "已拒绝" }}</XhApprovalResult>
      <XhApprovalFooter>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalFooter>
      <XhApprovalLiveRegion />
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
