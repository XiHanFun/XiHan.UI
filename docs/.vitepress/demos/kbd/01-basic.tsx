/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 单键与组合键使用同一组件
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhKbd keys={["Escape"]} />
      <XhKbd keys={["Mod", "K"]} />
    </div>
  );
}
