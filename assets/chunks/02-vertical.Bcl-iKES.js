const n=`// 垂直分隔线 | 分隔行内内容
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", blockSize: "24px" }}>
      <span>概览</span>
      <XhSeparator orientation="vertical" decorative />
      <span>分析</span>
      <XhSeparator orientation="vertical" decorative />
      <span>报告</span>
    </div>
  );
}
`;export{n as default};
