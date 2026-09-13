const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | disabled 同时挡住指针与键盘，状态机收不到 TOGGLE
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSwitch disabled />
      <XhSwitch disabled defaultChecked />
    </>
  );
}
`;export{e as default};
