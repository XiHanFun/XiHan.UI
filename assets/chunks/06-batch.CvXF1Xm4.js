var e=`// 批量处理 | 闸门是单发的，批量是宿主的编排：每条请求一个闸门、判定受控，上面一行放全部批准与全部拒绝；全部批准只收必选项已勾满的那几条（canApproveScopes），没勾满的留着逐条处理
import type { ApprovalScope, ApprovalStatus } from "@xihan-ui/headless";
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";
import { useState } from "react";

interface Request {
  id: string;
  title: string;
  detail: string;
  scopes: ApprovalScope[];
  granted: string[];
  status: ApprovalStatus;
}

const initial: Request[] = [
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
];

export default function Demo(): ReactNode {
  const [requests, setRequests] = useState(initial);
  const update = (id: string, patch: Partial<Request>): void =>
    setRequests(list => list.map(request => (request.id === id ? { ...request, ...patch } : request)));

  const pending = requests.filter(request => request.status === "pending");
  // 必选项没勾满的批不了：批量批准跳过它们，留给用户逐条处理
  const approvable = pending.filter(request => canApproveScopes(request.scopes, request.granted));

  function settleAll(ids: string[], status: ApprovalStatus): void {
    setRequests(list => list.map(request => (ids.includes(request.id) ? { ...request, status } : request)));
  }

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
        <span>{\`\${pending.length} 项待决\`}</span>
        <XhButton size="sm" disabled={approvable.length === 0} onClick={() => settleAll(approvable.map(request => request.id), "approved")}>
          {\`全部批准（\${approvable.length}）\`}
        </XhButton>
        <XhButton size="sm" variant="outline" disabled={pending.length === 0} onClick={() => settleAll(pending.map(request => request.id), "denied")}>
          全部拒绝
        </XhButton>
      </div>
      {requests.map(request => (
        // 判定受控：闸门报出意图，宿主写回才落定
        <XhApprovalRoot
          key={request.id}
          requestId={request.id}
          status={request.status}
          scopes={request.scopes}
          grantedScopes={request.granted}
          onGrantedScopesChange={details => update(request.id, { granted: details.value })}
          onDecision={details => update(request.id, { status: details.decision })}
        >
          <XhApprovalTitle>{request.title}</XhApprovalTitle>
          <XhApprovalDescription>{request.detail}</XhApprovalDescription>
          {request.scopes.length > 0 && (
            <XhApprovalGroup>
              {request.scopes.map(scope => (
                <XhApprovalItem key={scope.value} scopeValue={scope.value} scopeLabel={scope.label} scopeRequired={scope.required}>
                  <XhApprovalItemIndicator scopeValue={scope.value} />
                  <XhApprovalItemText scopeValue={scope.value}>{scope.label}</XhApprovalItemText>
                </XhApprovalItem>
              ))}
            </XhApprovalGroup>
          )}
          <XhApprovalResult>{request.status === "approved" ? "已批准" : "已拒绝"}</XhApprovalResult>
          <XhApprovalFooter>
            <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
            <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
          </XhApprovalFooter>
        </XhApprovalRoot>
      ))}
    </div>
  );
}
`;export{e as default};