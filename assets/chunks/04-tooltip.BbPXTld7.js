const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 原生提示 | 仅在内容溢出时显示完整文本
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "240px", maxInlineSize: "100%" }}>
      <XhTruncate tooltip>浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室</XhTruncate>
    </div>
  );
}
`;export{n as default};
