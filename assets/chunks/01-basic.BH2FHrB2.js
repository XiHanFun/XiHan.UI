const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 单行文本溢出时显示省略号
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "280px", maxInlineSize: "100%" }}>
      <XhTruncate>XiHan.UI 提供框架无关的 Headless UI 组件与多端适配器。</XhTruncate>
    </div>
  );
}
`;export{n as default};
