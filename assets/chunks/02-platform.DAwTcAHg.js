const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 平台 | 使用对应平台的修饰键格式
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhKbdGroup keys={["Mod", "S"]} platform="mac" />
      <XhKbdGroup keys={["Mod", "S"]} platform="other" />
    </>
  );
}
`;export{n as default};
