const e=`// 侧栏位置 | 将侧栏放在行首或行尾
import type { ReactNode } from "react";
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "min(560px, 100%)" }}>
      <XhLayoutRoot bordered style={{ blockSize: "150px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
        <XhLayoutHeader>行首侧栏</XhLayoutHeader>
        <XhLayoutSider>导航</XhLayoutSider>
        <XhLayoutContent>正文</XhLayoutContent>
      </XhLayoutRoot>
      <XhLayoutRoot siderPlacement="end" bordered style={{ blockSize: "150px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
        <XhLayoutHeader>行尾侧栏</XhLayoutHeader>
        <XhLayoutSider>属性</XhLayoutSider>
        <XhLayoutContent>正文</XhLayoutContent>
      </XhLayoutRoot>
    </div>
  );
}
`;export{e as default};
