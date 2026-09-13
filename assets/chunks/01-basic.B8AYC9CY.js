const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 显示带背景的图标
import type { ReactNode } from "react";
import { BellIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhIconWrapper>
      <XhIcon icon={BellIcon} />
    </XhIconWrapper>
  );
}
`;export{n as default};
