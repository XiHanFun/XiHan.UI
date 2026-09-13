const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标签左置 | 将标签放在控件左侧
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 第一列放标题，第二列放控件、说明与错误文案
    <XhFieldRoot
      invalid
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        alignItems: "center",
        columnGap: "12px",
        rowGap: "4px",
        inlineSize: "360px",
      }}
    >
      <XhFieldLabel>端口</XhFieldLabel>
      <XhFieldControl>
        <input defaultValue="abc" />
      </XhFieldControl>
      <XhFieldDescription style={{ gridColumnStart: 2 }}>留空表示使用默认端口</XhFieldDescription>
      <XhFieldErrorText style={{ gridColumnStart: 2 }}>端口只能是数字</XhFieldErrorText>
    </XhFieldRoot>
  );
}
`;export{n as default};
