const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | size 同时缩放轨道与滑块，不写就是缺省档
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch size="sm" defaultChecked />
        <span>小</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch defaultChecked />
        <span>缺省</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhSwitch size="lg" defaultChecked />
        <span>大</span>
      </span>
    </div>
  );
}
`;export{n as default};
