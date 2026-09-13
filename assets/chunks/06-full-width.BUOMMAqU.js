const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 宽度充满 | 选项等分可用宽度
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "list", label: "列表" },
  { value: "grid", label: "网格" },
  { value: "board", label: "看板" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(100%, 360px)" }}>
      <XhToggleGroupRoot collection={options} defaultValue="list" fullWidth />
    </div>
  );
}
`;export{n as default};
