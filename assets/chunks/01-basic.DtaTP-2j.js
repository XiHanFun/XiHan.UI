const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 在并列内容之间切换
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="overview" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="项目视图">
        <XhTabsTrigger value="overview">概览</XhTabsTrigger>
        <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
        <XhTabsTrigger value="reports">报告</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="overview">查看项目概览与近期活动。</XhTabsContent>
      <XhTabsContent value="analytics">分析访问趋势与关键指标。</XhTabsContent>
      <XhTabsContent value="reports">浏览已生成的项目报告。</XhTabsContent>
    </XhTabsRoot>
  );
}
`;export{n as default};
