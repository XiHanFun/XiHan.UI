/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 点击文本就地编辑
import type { ReactNode } from "react";
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhEditableRoot defaultValue="曦寒" placeholder="未填写">
      <XhEditableLabel>昵称</XhEditableLabel>
      <XhEditableControl>
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
        <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
      </XhEditableControl>
    </XhEditableRoot>
  );
}
