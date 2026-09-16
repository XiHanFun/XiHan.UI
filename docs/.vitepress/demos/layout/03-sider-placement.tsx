// 侧栏位置 | 将侧栏放在行首或行尾
import type { CSSProperties, ReactNode } from "react";
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "min(560px, 100%)" }}>
      <XhLayoutRoot split aria-label="行首侧栏布局" style={{ blockSize: "150px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
        <XhLayoutHeader><span data-demo-block="line" data-tone="brand" /></XhLayoutHeader>
        <XhLayoutSider><span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "100%" } as CSSProperties} /></XhLayoutSider>
        <XhLayoutContent><span data-demo-block data-tone="success" style={{ "--xh-demo-block-block-size": "100%" } as CSSProperties} /></XhLayoutContent>
      </XhLayoutRoot>
      <XhLayoutRoot siderPlacement="end" split aria-label="行尾侧栏布局" style={{ blockSize: "150px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
        <XhLayoutHeader><span data-demo-block="line" data-tone="warning" /></XhLayoutHeader>
        <XhLayoutSider><span data-demo-block data-tone="danger" style={{ "--xh-demo-block-block-size": "100%" } as CSSProperties} /></XhLayoutSider>
        <XhLayoutContent><span data-demo-block data-tone="neutral" style={{ "--xh-demo-block-block-size": "100%" } as CSSProperties} /></XhLayoutContent>
      </XhLayoutRoot>
    </div>
  );
}
