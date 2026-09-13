const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 状态 | 禁用、只读与空值
import type { ReactNode } from "react";
import {
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhEditableRoot defaultValue="改不动" placeholder="未填写" disabled>
        <XhEditableLabel>禁用</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot defaultValue="只能看" placeholder="未填写" readOnly>
        <XhEditableLabel>只读</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot placeholder="未填写">
        <XhEditableLabel>空值占位</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        </XhEditableControl>
      </XhEditableRoot>
    </>
  );
}
`;export{e as default};
