/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 垂直布局 | 用于侧栏式内容导航
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="account" orientation="vertical" variant="line" style={{ inlineSize: "420px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="账户设置">
        <XhTabsTrigger value="account">账户</XhTabsTrigger>
        <XhTabsTrigger value="security">安全</XhTabsTrigger>
        <XhTabsTrigger value="notifications">通知</XhTabsTrigger>
        <XhTabsIndicator />
      </XhTabsList>

      <XhTabsContent value="account">管理账户资料与偏好。</XhTabsContent>
      <XhTabsContent value="security">配置密码与登录验证。</XhTabsContent>
      <XhTabsContent value="notifications">设置消息通知方式。</XhTabsContent>
    </XhTabsRoot>
  );
}
