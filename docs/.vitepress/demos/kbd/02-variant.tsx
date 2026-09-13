/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 外观 | default 使用中性底，light 保持透明
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <XhKbd value="Enter" />
      <XhKbd value="Enter" variant="light" />
    </div>
  );
}
