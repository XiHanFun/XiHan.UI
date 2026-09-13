const n=`// 基础用法 | 水平排列内容
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFlex align="center" gap="sm">
      <span style={{ display: "grid", inlineSize: "40px", blockSize: "40px", placeItems: "center", borderRadius: "var(--xh-shape-pill)", background: "var(--xh-bg-brand-subtle)", color: "var(--xh-fg-brand)", fontWeight: 600 }}>林</span>
      <XhFlex orientation="vertical" gap="xs">
        <strong>林晓</strong>
        <span style={{ color: "var(--xh-fg-muted)", fontSize: "13px" }}>产品设计师</span>
      </XhFlex>
    </XhFlex>
  );
}
`;export{n as default};
