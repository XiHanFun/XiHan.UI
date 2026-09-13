/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自定义图形 | 直接提供 SVG 图形
import type { ReactNode } from "react";
import { XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhIcon viewBox="0 0 24 24" size="lg" label="曦寒标记">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 8L16 16M16 8L8 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </XhIcon>
  );
}
