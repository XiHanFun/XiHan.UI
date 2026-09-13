/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 形态 | 默认渐隐弧，另有 ring 整圈与 dots 三点
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSpinner label="加载中" />
      <XhSpinner variant="ring" label="加载中" />
      <XhSpinner variant="dots" label="加载中" />
    </>
  );
}
