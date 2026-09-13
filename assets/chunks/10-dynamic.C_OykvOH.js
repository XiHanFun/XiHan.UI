const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分隔线 | 在相邻标签之间增加视觉分组
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsSeparator,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="monthly" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="账单周期">
        <XhTabsTrigger value="monthly">按月</XhTabsTrigger>
        <XhTabsSeparator />
        <XhTabsTrigger value="quarterly">按季</XhTabsTrigger>
        <XhTabsSeparator />
        <XhTabsTrigger value="yearly">按年</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="monthly">每月自动续费，可随时取消。</XhTabsContent>
      <XhTabsContent value="quarterly">每三个月结算一次。</XhTabsContent>
      <XhTabsContent value="yearly">按年结算可享优惠。</XhTabsContent>
    </XhTabsRoot>
  );
}
`;export{n as default};
