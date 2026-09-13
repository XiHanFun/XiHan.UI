const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 为控件添加标签与说明
import type { ReactNode } from "react";
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFieldRoot style={{ inlineSize: "280px" }}>
      <XhFieldLabel>邮箱</XhFieldLabel>
      <XhFieldControl>
        <input type="email" placeholder="you@example.com" />
      </XhFieldControl>
      <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
    </XhFieldRoot>
  );
}
`;export{e as default};
