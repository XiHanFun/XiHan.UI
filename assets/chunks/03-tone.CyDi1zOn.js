const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 根据所在表面选择强调层级
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhCheckbox defaultChecked>主要复选框</XhCheckbox>
      <XhCheckbox variant="secondary" defaultChecked>次级复选框</XhCheckbox>
    </div>
  );
}
`;export{e as default};
