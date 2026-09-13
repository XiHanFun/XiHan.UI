const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 构建应用页面骨架
import type { ReactNode } from "react";
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot bordered siderBreakpoint="sm" style={{ inlineSize: "min(720px, 100%)", blockSize: "280px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
      <XhLayoutHeader><strong>XiHan Admin</strong></XhLayoutHeader>
      <XhLayoutSider>
        <div style={{ display: "grid", gap: "12px" }}>
          <span>概览</span>
          <span>用户</span>
          <span>设置</span>
        </div>
      </XhLayoutSider>
      <XhLayoutContent>
        <strong>欢迎回来</strong>
        <p style={{ color: "var(--xh-fg-muted)" }}>这里是今日的项目概览。</p>
      </XhLayoutContent>
      <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
    </XhLayoutRoot>
  );
}
`;export{n as default};
