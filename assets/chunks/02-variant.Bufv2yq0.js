const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 设置按钮外观
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton variant="solid">主要</XhButton>
      <XhButton variant="subtle">次要</XhButton>
      <XhButton variant="outline">线框</XhButton>
      <XhButton variant="ghost">幽灵</XhButton>
    </>
  );
}
`;export{n as default};
