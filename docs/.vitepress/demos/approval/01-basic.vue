<!-- 基础用法 | 勾选与判定是原子的：批准的载荷带着批的是哪几项，不存在「已批准但范围还没同步」的窗口 -->
<script setup lang="ts">
import type { ApprovalScope } from "@xihan-ui/headless";
import {
  XhApprovalActions,
  XhApprovalAnnouncement,
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalScopeGroup,
  XhApprovalScopeIndicator,
  XhApprovalScopeItem,
  XhApprovalScopeLabel,
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
      <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
      <XhApprovalDescription>它想读一遍 src/ 并写回改动。</XhApprovalDescription>
      <XhApprovalScopeGroup>
        <XhApprovalScopeItem
          v-for="scope in scopes"
          :key="scope.value"
          :scope-value="scope.value"
          :scope-label="scope.label"
          :scope-required="scope.required"
        >
          <!-- 勾由皮肤画：指示符留空即可，不必手打记号 -->
          <XhApprovalScopeIndicator :scope-value="scope.value" />
          <XhApprovalScopeLabel :scope-value="scope.value">{{ scope.label }}</XhApprovalScopeLabel>
        </XhApprovalScopeItem>
      </XhApprovalScopeGroup>
      <XhApprovalResult>{{ status === "approved" ? "已批准" : "已拒绝" }}</XhApprovalResult>
      <XhApprovalActions>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalActions>
      <XhApprovalAnnouncement />
    </XhApprovalRoot>
    <p v-if="decided" style="margin: 0;">判定：{{ decided }}</p>
  </div>
</template>
