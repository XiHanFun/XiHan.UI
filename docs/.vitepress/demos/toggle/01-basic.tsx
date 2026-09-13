/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 切换点赞状态
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToggle>
      <XhIcon icon={HeartIcon} />
      点赞
    </XhToggle>
  );
}
