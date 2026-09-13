/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多行截断 | 限制文本显示两行
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTruncate lines={2}>
        组件状态与无障碍逻辑由无头内核统一管理，Vue、React 与 Web Components 适配器共享同一份行为定义。
      </XhTruncate>
    </div>
  );
}
