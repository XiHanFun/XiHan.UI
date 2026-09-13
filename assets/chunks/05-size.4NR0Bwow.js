const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | 适配不同的信息密度
import type { ReactNode } from "react";
import { XhBreadcrumbRoot } from "@xihan-ui/react";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
const sizes = [
  { label: "小", value: "sm" },
  { label: "中", value: undefined },
  { label: "大", value: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "min(560px, 100%)" }}>
      {sizes.map(({ label, value }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ inlineSize: "24px", color: "var(--xh-fg-muted)" }}>{label}</span>
          <XhBreadcrumbRoot collection={items} size={value} />
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
