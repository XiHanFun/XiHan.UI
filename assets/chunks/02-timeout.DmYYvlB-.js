const e=`// 超时按拒绝收口 | 缺省不给默认超时值：替宿主定安全策略比不定更危险。到点落成拒绝，expired 只是显示态
import type { ApprovalStatus } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalTimer,
  XhApprovalTitle,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

function resultText(status: ApprovalStatus): string {
  if (status === "approved") {
    return "已批准";
  }
  return status === "expired" ? "超时未答，按拒绝处理" : "已拒绝";
}

export default function Demo(): ReactNode {
  const [left, setLeft] = useState(10);
  const [decided, setDecided] = useState("");

  // 倒计时挂载后才起：效应只在浏览器里跑，服务端渲染那一遍没有 window。数到 0 就不再续下一拍
  useEffect(() => {
    if (left <= 0) {
      return;
    }
    const timer = window.setTimeout(setLeft, 1000, left - 1);
    return () => window.clearTimeout(timer);
  }, [left]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <XhApprovalRoot
        timeoutMs={10000}
        tone="danger"
        onDecision={details => setDecided(\`\${details.decision}（来源 \${details.source}）\`)}
      >
        {({ status }) => (
          <>
            <XhApprovalTitle>要执行一条删除命令</XhApprovalTitle>
            <XhApprovalDescription>没人答的话，到点按拒绝处理。</XhApprovalDescription>
            {/* 剩余时间对读屏隐藏：逐秒跳字进活区会不停打断 */}
            <XhApprovalTimer>{\`还剩 \${left} 秒\`}</XhApprovalTimer>
            <XhApprovalResult>{resultText(status)}</XhApprovalResult>
            <XhApprovalFooter>
              <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
              <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
            </XhApprovalFooter>
          </>
        )}
      </XhApprovalRoot>
      {decided ? <p style={{ margin: 0 }}>{\`判定：\${decided}\`}</p> : null}
    </div>
  );
}
`;export{e as default};
