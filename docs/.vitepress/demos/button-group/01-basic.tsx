/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 组合相关操作
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const views = ["照片", "视频", "更多"];

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup>
      {views.map(view => <XhButton key={view}>{view}</XhButton>)}
    </XhButtonGroup>
  );
}
