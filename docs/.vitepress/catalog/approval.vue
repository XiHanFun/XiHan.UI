<script setup lang="ts">
import type { ApprovalScope } from "@xihan-ui/headless";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalLiveRegion,
  XhApprovalRoot,
  XhApprovalTitle,
} from "@xihan-ui/vue";

const scopes: ApprovalScope[] = [
  { value: "read", label: "读取 src/", required: true },
];
</script>

<template>
  <XhApprovalRoot :scopes="scopes" style="inline-size: var(--xh-doc-catalog-w)">
    <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
    <XhApprovalGroup>
      <XhApprovalItem v-for="scope in scopes" :key="scope.value" :scope-value="scope.value" :scope-label="scope.label" :scope-required="scope.required">
        <XhApprovalItemIndicator :scope-value="scope.value" />
        <XhApprovalItemText :scope-value="scope.value">{{ scope.label }}</XhApprovalItemText>
      </XhApprovalItem>
    </XhApprovalGroup>
    <XhApprovalFooter>
      <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
      <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
    </XhApprovalFooter>
    <XhApprovalLiveRegion />
  </XhApprovalRoot>
</template>
