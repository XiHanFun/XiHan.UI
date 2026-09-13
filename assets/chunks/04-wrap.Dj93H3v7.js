const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 换行 | 每组内部保持为一个单元
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", inlineSize: "180px" }}>
      <XhKbdGroup keys={["Mod", "Shift", "P"]} />
      <XhKbdGroup keys={["Alt", "ArrowDown"]} />
      <XhKbdGroup keys={["Mod", "Enter"]} />
    </div>
  );
}
`;export{n as default};
