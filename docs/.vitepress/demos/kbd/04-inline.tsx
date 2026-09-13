/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 行内提示 | 键帽可以嵌入说明文字，但不承担按钮或快捷键监听职责
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ margin: 0 }}>
      <span>按 </span>
      <XhKbd value="Escape" />
      <span> 关闭当前浮层。</span>
    </p>
  );
}
