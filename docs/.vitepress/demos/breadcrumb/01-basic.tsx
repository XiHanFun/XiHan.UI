/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 显示当前页面的层级路径
import type { ReactNode } from "react";
import { XhBreadcrumbRoot } from "@xihan-ui/react";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "navigation", label: "导航", href: "#/components#navigation" },
  { value: "breadcrumb", label: "面包屑", current: true },
];

export default function Demo(): ReactNode {
  return <XhBreadcrumbRoot collection={items} />;
}
