/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 底部固定 | 将操作栏固定在底部
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useRef } from "react";

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollEl}
      style={{
        blockSize: "240px",
        inlineSize: "min(420px, 100%)",
        overflow: "auto",
        padding: "12px",
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
      }}
    >
      <div style={{ blockSize: "80px" }}>订单列表</div>

      <XhAffixRoot target={() => scrollEl.current} offsetBottom={12}>
        <XhAffixContent
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "var(--xh-shape-control)",
            background: "var(--xh-bg-surface-raised)",
            boxShadow: "var(--xh-elevation-floating)",
          }}
        >
          <span>共 42 项</span>
          <span>已选 3 项</span>
        </XhAffixContent>
      </XhAffixRoot>

      <div style={{ blockSize: "600px" }} />
    </div>
  );
}
