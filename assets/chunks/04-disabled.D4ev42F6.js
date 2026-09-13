const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 状态 | 禁用与只读表单
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhFormRoot disabled defaultValues={{ token: "xh-0f2a" }} style={{ inlineSize: "260px" }}>
        <XhFormFieldGroup name="token">
          {({ value, setValue }) => (
            <XhFieldRoot disabled>
              <XhFieldLabel>接入令牌</XhFieldLabel>
              <XhFieldControl>
                <input
                  disabled
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldDescription>整表禁用</XhFieldDescription>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>

        <div style={{ display: "flex", gap: "8px" }}>
          <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
          <XhFormResetTrigger>重置</XhFormResetTrigger>
        </div>
      </XhFormRoot>

      <XhFormRoot
        readOnly
        defaultValues={{ token: "xh-0f2a" }}
        style={{ inlineSize: "260px" }}
      >
        <XhFormFieldGroup name="token">
          {({ value, setValue }) => (
            <XhFieldRoot>
              <XhFieldLabel>接入令牌</XhFieldLabel>
              <XhFieldControl>
                <input
                  readOnly
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldDescription>只读：能提交，改不动</XhFieldDescription>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>

        <div style={{ display: "flex", gap: "8px" }}>
          <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
          <XhFormResetTrigger>重置</XhFormResetTrigger>
        </div>
      </XhFormRoot>
    </>
  );
}
`;export{e as default};
