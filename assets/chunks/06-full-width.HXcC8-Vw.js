const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 宽度充满 | 按钮等分可用宽度
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <XhButtonGroup fullWidth>
        <XhButton>上一页</XhButton>
        <XhButton>下一页</XhButton>
      </XhButtonGroup>
    </div>
  );
}
`;export{n as default};
