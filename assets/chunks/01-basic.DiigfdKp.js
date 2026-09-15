const n=`// 基础用法 | 分隔内容区域
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(480px, 100%)" }}>
      <strong>账户设置</strong>
      <p style={{ color: "var(--xh-fg-muted)" }}>管理个人资料与登录方式。</p>
      <XhSeparator />
      <strong style={{ display: "block", marginBlockStart: "16px" }}>通知设置</strong>
      <p style={{ marginBlockEnd: 0, color: "var(--xh-fg-muted)" }}>选择需要接收的消息。</p>
    </div>
  );
}
`;export{n as default};
