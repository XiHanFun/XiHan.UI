/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 给 value 就画码，版本按内容长度自动选；缺省 M 级纠错、4 个模块的静区
import type { ReactNode } from "react";
import { XhQrCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhQrCode value="https://ui.xihanfun.com" />;
}
