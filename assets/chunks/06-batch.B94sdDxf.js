var e=`<!-- 批量处理 | 闸门是单发的，批量是宿主的编排：每条请求一个闸门、判定受控，上面一行放全部批准与全部拒绝；全部批准只收必选项已勾满的那几条（canApproveScopes），没勾满的留着逐条处理 -->
<script setup lang="ts">
import type { ApprovalDecisionDetails, ApprovalScope, ApprovalStatus } from "@xihan-ui/headless";
import { canApproveScopes } from "@xihan-ui/headless";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalTitle,
  XhButton,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

interface Request {
  id: string;
  title: string;
  detail: string;
  scopes: ApprovalScope[];
  granted: string[];
  status: ApprovalStatus;
}

const requests = ref<Request[]>([
  { id: "r1", title: "读取 package.json", detail: "只读，不改任何文件。", scopes: [], granted: [], status: "pending" },
  {
    id: "r2",
    title: "运行 pnpm install",
    detail: "会改写 node_modules 与锁文件。",
    scopes: [{ value: "network", label: "访问网络下载依赖", required: true }],
    granted: [],
    status: "pending",
  },
  { id: "r3", title: "写入 src/config.ts", detail: "把超时从 5 秒改成 30 秒。", scopes: [], granted: [], status: "pending" },
]);

const pending = computed(() => requests.value.filter(request => request.status === "pending"));
// 必选项没勾满的批不了：批量批准跳过它们，留给用户逐条处理
const approvable = computed(() => pending.value.filter(request => canApproveScopes(request.scopes, request.granted)));

// 判定受控：闸门报出意图，宿主写回才落定
function decide(request: Request, details: ApprovalDecisionDetails): void {
  request.status = details.decision;
}

function approveAll(): void {
  for (const request of approvable.value)
    request.status = "approved";
}

function denyAll(): void {
  for (const request of pending.value)
    request.status = "denied";
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
      <span>{{ pending.length }} 项待决</span>
      <XhButton size="sm" :disabled="approvable.length === 0" @click="approveAll">全部批准（{{ approvable.length }}）</XhButton>
      <XhButton size="sm" variant="outline" :disabled="pending.length === 0" @click="denyAll">全部拒绝</XhButton>
    </div>
    <XhApprovalRoot
      v-for="request in requests"
      :key="request.id"
      v-model:granted-scopes="request.granted"
      :request-id="request.id"
      :status="request.status"
      :scopes="request.scopes"
      @decision="decide(request, $event)"
    >
      <XhApprovalTitle>{{ request.title }}</XhApprovalTitle>
      <XhApprovalDescription>{{ request.detail }}</XhApprovalDescription>
      <XhApprovalGroup v-if="request.scopes.length > 0">
        <XhApprovalItem
          v-for="scope in request.scopes"
          :key="scope.value"
          :scope-value="scope.value"
          :scope-label="scope.label"
          :scope-required="scope.required"
        >
          <XhApprovalItemIndicator :scope-value="scope.value" />
          <XhApprovalItemText :scope-value="scope.value">{{ scope.label }}</XhApprovalItemText>
        </XhApprovalItem>
      </XhApprovalGroup>
      <XhApprovalResult>{{ request.status === "approved" ? "已批准" : "已拒绝" }}</XhApprovalResult>
      <XhApprovalFooter>
        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
      </XhApprovalFooter>
    </XhApprovalRoot>
  </div>
</template>
`;export{e as default};