// 固定区域 | 固定页头和侧栏
import type { CSSProperties, ReactNode } from "react";
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

const rows = Array.from({ length: 12 }, (_, index) => `内容区 ${String(index + 1).padStart(2, "0")}`);

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(640px, 100%)", blockSize: "260px", overflow: "auto", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-page)" }}>
      <XhLayoutRoot headerFixed siderFixed bordered style={{ "--xh-layout-scrollport-h": "260px" } as CSSProperties}>
        <XhLayoutHeader><strong>控制台</strong></XhLayoutHeader>
        <XhLayoutSider>导航</XhLayoutSider>
        <XhLayoutContent>{rows.map(row => <p key={row} style={{ marginBlock: "0 16px" }}>{row}</p>)}</XhLayoutContent>
        <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
      </XhLayoutRoot>
    </div>
  );
}
