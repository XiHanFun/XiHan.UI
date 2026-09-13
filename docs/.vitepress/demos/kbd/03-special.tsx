/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 特殊键 | 常用修饰键、方向键与操作键由 Headless 统一格式化
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

const keys = ["Mod", "Shift", "ArrowUp", "Escape", "Enter"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {keys.map(key => <XhKbd key={key} value={key} />)}
    </div>
  );
}
