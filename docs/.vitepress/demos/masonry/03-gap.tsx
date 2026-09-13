/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 间距 | 设置列与项目之间的间距
import type { ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const items = ["设计", "开发", "测试", "发布"];
const gaps = ["sm", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {gaps.map(gap => (
        <div key={gap} style={{ inlineSize: "min(280px, 100%)" }}>
          <div style={{ marginBlockEnd: "8px", color: "var(--xh-fg-muted)", fontSize: "13px" }}>{gap}</div>
          <XhMasonry columns={2} gap={gap}>
            {items.map((item, index) => (
              <div key={item} style={{ padding: `${12 + index * 5}px 12px`, borderRadius: "var(--xh-shape-control)", background: "var(--xh-bg-brand-subtle)", color: "var(--xh-fg-brand)" }}>{item}</div>
            ))}
          </XhMasonry>
        </div>
      ))}
    </div>
  );
}
