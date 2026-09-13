/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 使用主要或次级输入表面
import type { ReactNode } from "react";
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <XhInputGroupRoot variant="primary">
        <XhInputGroupItem>¥</XhInputGroupItem>
        <XhTextFieldRoot placeholder="主要表面">
          <XhTextFieldControl>
            <XhTextFieldInput inputMode="decimal" aria-label="主要金额" />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhInputGroupRoot>

      <XhInputGroupRoot variant="secondary">
        <XhInputGroupItem>¥</XhInputGroupItem>
        <XhTextFieldRoot placeholder="次级表面">
          <XhTextFieldControl>
            <XhTextFieldInput inputMode="decimal" aria-label="次要金额" />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhInputGroupRoot>
    </div>
  );
}
