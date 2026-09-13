const t=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 外形 | 使用圆形或方形触发器
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhFloatButtonRoot style={{ position: "static" }} shape="circle">
        <XhFloatButtonTrigger />
        <XhFloatButtonList />
      </XhFloatButtonRoot>
      <XhFloatButtonRoot style={{ position: "static" }} shape="square">
        <XhFloatButtonTrigger />
        <XhFloatButtonList />
      </XhFloatButtonRoot>
    </>
  );
}
`;export{t as default};
