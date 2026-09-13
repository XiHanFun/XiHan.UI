const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 不传 checked 即为非受控，开关自己维护状态
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSwitch />
      <XhSwitch defaultChecked />
    </>
  );
}
`;export{n as default};
