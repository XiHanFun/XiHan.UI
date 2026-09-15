const e=`// 基础用法 | 勾选与判定是原子的：批准的载荷带着批的是哪几项，不存在「已批准但范围还没同步」的窗口
import type { ApprovalScope } from "@xihan-ui/headless";
import type { ReactNode } from "react";
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
  XhApprovalTitle,
} from "@xihan-ui/react";
import { useState } from "react";

const scopes: ApprovalScope[] = [
  { value: "read", label: "读取 src/ 下的文件", required: true },
  { value: "write", label: "写回改动" },
];

export default function Demo(): ReactNode {
  const [decided, setDecided] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* 必选项没勾满就批不了；拒绝这条路不受它影响 */}
      <XhApprovalRoot
        scopes={scopes}
        tone="warning"
        onDecision={details => setDecided(
          \`\${details.decision}（来源 \${details.source}，范围 \${details.scopes.join("、") || "无"}）\`,
        )}
      >
        {({ status }) => (
          <>
            <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
            <XhApprovalDescription>它想读一遍 src/ 并写回改动。</XhApprovalDescription>
            <XhApprovalGroup>
              {scopes.map(scope => (
                <XhApprovalItem
                  key={scope.value}
                  scopeValue={scope.value}
                  scopeLabel={scope.label}
                  scopeRequired={scope.required}
                >
                  {/* 勾由皮肤画：指示符留空即可，不必手打记号 */}
                  <XhApprovalItemIndicator scopeValue={scope.value} />
                  <XhApprovalItemText scopeValue={scope.value}>{scope.label}</XhApprovalItemText>
                </XhApprovalItem>
              ))}
            </XhApprovalGroup>
            <XhApprovalResult>{status === "approved" ? "已批准" : "已拒绝"}</XhApprovalResult>
            <XhApprovalFooter>
              <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
              <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
            </XhApprovalFooter>
            <XhApprovalLiveRegion />
          </>
        )}
      </XhApprovalRoot>
      {decided ? <p style={{ margin: 0 }}>{\`判定：\${decided}\`}</p> : null}
    </div>
  );
}
`;export{e as default};
