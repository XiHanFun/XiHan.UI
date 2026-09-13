const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提交方式 | 使用失焦或回车提交
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
    <>
      <XhEditableRoot
        defaultValue="失焦即提交"
        placeholder="未填写"
        submitMode="blur"
      >
        <XhEditableLabel>submitMode = blur</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
          <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
          <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot
        defaultValue="回车才提交"
        placeholder="未填写"
        submitMode="enter"
      >
        <XhEditableLabel>submitMode = enter</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
          <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
          <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
        </XhEditableControl>
      </XhEditableRoot>
    </>
  );
}
`;export{e as default};
