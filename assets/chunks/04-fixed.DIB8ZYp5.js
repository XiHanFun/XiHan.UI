const o=`// 固定区域 | 固定页头和侧栏
import type { CSSProperties, ReactNode } from "react";
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length] }));

export default function Demo(): ReactNode {
  return (
    <div data-xh-scroll="" style={{ inlineSize: "min(640px, 100%)", blockSize: "260px", overflow: "auto", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-page)" }}>
      <XhLayoutRoot headerFixed siderFixed split style={{ "--xh-layout-scrollport-h": "260px" } as CSSProperties}>
        <XhLayoutHeader><span data-demo-block="line" data-tone="brand" style={{ "--xh-demo-block-inline-size": "96px" } as CSSProperties} /></XhLayoutHeader>
        <XhLayoutSider><span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "100%", "--xh-demo-block-min-block-size": "100%" } as CSSProperties} /></XhLayoutSider>
        <XhLayoutContent>{rows.map(row => <span key={row.id} data-demo-block="line" data-tone={row.tone} style={{ marginBlock: "16px" }} />)}</XhLayoutContent>
        <XhLayoutFooter><span data-demo-block="line" data-tone="neutral" style={{ "--xh-demo-block-inline-size": "80px" } as CSSProperties} /></XhLayoutFooter>
      </XhLayoutRoot>
    </div>
  );
}
`;export{o as default};
