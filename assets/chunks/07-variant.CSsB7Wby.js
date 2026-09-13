const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 形态 | ring 整圈、arc 一段弧、dots 三点；缺省档 ring 不输出 data-variant
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSpinner label="加载中" />
      <XhSpinner variant="arc" label="加载中" />
      <XhSpinner variant="dots" label="加载中" />
    </>
  );
}
`;export{n as default};
