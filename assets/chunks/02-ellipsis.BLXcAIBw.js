const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 折叠层级 | 收起过长路径的中间部分
import type { ReactNode } from "react";
import { XhBreadcrumbRoot } from "@xihan-ui/react";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "docs", label: "文档", href: "#/docs" },
  { value: "guides", label: "指南", href: "#/docs/guides" },
  { value: "components", label: "组件", href: "#/docs/guides/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];

export default function Demo(): ReactNode {
  return <XhBreadcrumbRoot collection={items} maxItems={3} />;
}
`;export{e as default};
