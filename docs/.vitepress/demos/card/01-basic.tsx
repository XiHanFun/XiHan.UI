/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | Header 放标题与说明，Content 放主体
import type { ReactNode } from "react";
import { XhCardContent, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCardRoot style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhCardHeader>
        <XhCardTitle>本月账单</XhCardTitle>
        <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
      </XhCardHeader>
      <XhCardContent>共 128 笔支出，合计 3,240.00 元。</XhCardContent>
    </XhCardRoot>
  );
}
