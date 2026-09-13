/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 垂直分隔线 | 分隔行内内容
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", blockSize: "24px" }}>
      <span>概览</span>
      <XhSeparator orientation="vertical" decorative />
      <span>分析</span>
      <XhSeparator orientation="vertical" decorative />
      <span>报告</span>
    </div>
  );
}
