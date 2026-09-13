const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | size 只换直径，缺省档 md 不输出 data-size
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSpinner size="sm" label="加载中" />
      <XhSpinner label="加载中" />
      <XhSpinner size="lg" label="加载中" />
    </>
  );
}
`;export{n as default};
