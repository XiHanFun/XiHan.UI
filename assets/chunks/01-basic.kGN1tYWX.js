const e=`// 基础用法 | 构建应用页面骨架
import type { CSSProperties, ReactNode } from "react";
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot split siderBreakpoint="sm" aria-label="应用页面布局占位区块" style={{ inlineSize: "min(720px, 100%)", blockSize: "280px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
      <XhLayoutHeader>
        <span data-demo-block="line" data-tone="brand" style={{ "--xh-demo-block-inline-size": "112px" } as CSSProperties} />
      </XhLayoutHeader>
      <XhLayoutSider>
        <div style={{ display: "grid", gap: "12px" }}>
          {["brand", "info", "success"].map(tone => <span key={tone} data-demo-block="line" data-tone={tone} />)}
        </div>
      </XhLayoutSider>
      <XhLayoutContent>
        <span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "112px" } as CSSProperties} />
      </XhLayoutContent>
      <XhLayoutFooter>
        <span data-demo-block="line" data-tone="neutral" style={{ "--xh-demo-block-inline-size": "80px" } as CSSProperties} />
      </XhLayoutFooter>
    </XhLayoutRoot>
  );
}
`;export{e as default};
