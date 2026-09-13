const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 默认与幽灵外观
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggle defaultPressed>
        <XhIcon icon={HeartIcon} />
        默认
      </XhToggle>
      <XhToggle variant="ghost">
        <XhIcon icon={HeartIcon} />
        幽灵
      </XhToggle>
    </>
  );
}
`;export{n as default};
