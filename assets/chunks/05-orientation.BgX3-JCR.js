const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 方向 | 水平或垂直排列
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggleGroupRoot collection={options} defaultValue="day" />
      <XhToggleGroupRoot collection={options} defaultValue="day" orientation="vertical" />
    </>
  );
}
`;export{n as default};
