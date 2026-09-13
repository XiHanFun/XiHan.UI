/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 外观 | 设置角度、间距、字号和透明度
import type { ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

const looks = [
  { label: "默认", rotate: undefined, gap: undefined, fontSize: undefined, opacity: undefined },
  { label: "紧凑", rotate: 0, gap: 8, fontSize: 12, opacity: 0.18 },
  { label: "宽松", rotate: -45, gap: 56, fontSize: 18, opacity: 0.12 },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {looks.map(l => (
        <XhWatermarkRoot
          key={l.label}
          text="曦寒"
          rotate={l.rotate}
          gap={l.gap}
          fontSize={l.fontSize}
          opacity={l.opacity}
          style={{ inlineSize: "220px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
        >
          <XhWatermarkContent>
            <div style={{ padding: "16px", blockSize: "160px", fontSize: "13px" }}>{l.label}</div>
          </XhWatermarkContent>
        </XhWatermarkRoot>
      ))}
    </div>
  );
}
