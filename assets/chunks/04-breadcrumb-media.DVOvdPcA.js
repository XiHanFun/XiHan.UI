const e=`// 导航与媒体 | 补充页面路径和对象标识
import type { ReactNode } from "react";
import {
  XhPageHeaderBreadcrumb,
  XhPageHeaderDescription,
  XhPageHeaderMedia,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPageHeaderRoot variant="outline" style={{ inlineSize: "min(720px, 100%)" }}>
      <XhPageHeaderBreadcrumb>工作台 / 客户 / Acme Inc.</XhPageHeaderBreadcrumb>
      <XhPageHeaderMedia>
        <span style={{ display: "grid", placeItems: "center", inlineSize: "40px", blockSize: "40px", borderRadius: "var(--xh-shape-pill)", background: "var(--xh-bg-brand-subtle)", color: "var(--xh-fg-brand)", fontWeight: 600 }}>A</span>
      </XhPageHeaderMedia>
      <XhPageHeaderTitle>Acme Inc.</XhPageHeaderTitle>
      <XhPageHeaderDescription>企业客户 · 最近联系于昨天</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  );
}
`;export{e as default};
