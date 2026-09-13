const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 仪表盘 | variant="dashboard" 在环上留一个缺口，gapDegree 与 gapPosition 决定它多大、朝哪
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <XhProgress variant="dashboard" value={64} />
      <XhProgress variant="dashboard" value={64} gapDegree={140} />
      <XhProgress variant="dashboard" value={64} gapPosition="top" tone="warning" />
      <XhProgress variant="dashboard" value={64} gapPosition="left" gapDegree={40} />
    </div>
  );
}
`;export{e as default};
