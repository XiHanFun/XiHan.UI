const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 折叠侧栏 | 保留侧栏节点并切换宽度
import type { ReactNode } from "react";
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider, XhLayoutSiderTrigger } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot bordered style={{ inlineSize: "min(640px, 100%)", blockSize: "240px", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
        <strong>控制台</strong>
      </XhLayoutHeader>
      <XhLayoutSider>
        <div style={{ display: "grid", gap: "12px" }}>
          <span>概览</span>
          <span>收藏</span>
          <span>回收站</span>
        </div>
      </XhLayoutSider>
      <XhLayoutContent>项目动态</XhLayoutContent>
    </XhLayoutRoot>
  );
}
`;export{n as default};
