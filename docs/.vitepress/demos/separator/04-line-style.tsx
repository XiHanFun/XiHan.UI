/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 设置分隔线强度和线型
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr)", alignItems: "center", gap: "16px", inlineSize: "min(480px, 100%)" }}>
      <span>默认</span>
      <XhSeparator decorative />
      <span>弱化</span>
      <XhSeparator decorative variant="subtle" />
      <span>强调</span>
      <XhSeparator decorative variant="strong" />
      <span>虚线</span>
      <XhSeparator decorative dashed />
    </div>
  );
}
