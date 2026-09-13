/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 空态 | 没有选项时显示简洁提示
import type { ReactNode } from "react";
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhListboxRoot collection={[]} style={{ inlineSize: "min(100%, 300px)" }}>
      <XhListboxLabel>团队成员</XhListboxLabel>
      <XhListboxContent />
      <XhListboxEmpty>暂无成员</XhListboxEmpty>
    </XhListboxRoot>
  );
}
