// 折叠侧栏 | 保留侧栏节点并切换宽度
import type { CSSProperties, ReactNode } from "react";
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider, XhLayoutSiderTrigger } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot bordered style={{ inlineSize: "min(640px, 100%)", blockSize: "240px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
        <span data-demo-block="line" data-tone="brand" style={{ "--xh-demo-block-inline-size": "96px" } as CSSProperties} />
      </XhLayoutHeader>
      <XhLayoutSider>
        <div style={{ display: "grid", gap: "12px" }}>
          <span data-demo-block="line" data-tone="brand" />
          <span data-demo-block="line" data-tone="info" />
          <span data-demo-block="line" data-tone="success" />
        </div>
      </XhLayoutSider>
      <XhLayoutContent><span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "96px" } as CSSProperties} /></XhLayoutContent>
    </XhLayoutRoot>
  );
}
