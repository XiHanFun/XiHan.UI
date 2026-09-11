// 禁用与只读 | disabled 把提交、重置、写值三条路一起封死；read-only 只封写值与重置，提交照发
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
import { useState } from "react";

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("（还没提交过）");

  function onSubmit(details: { values: Record<string, unknown> }): void {
    setSubmitted(JSON.stringify(details.values));
  }

  return (
    <>
      {/* 整表禁用：两颗按钮自带原生 disabled，控件那一侧的 disabled 由自己落 */}
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

      {/* 只读：重置键置灰、写值不发生，提交仍旧把当下这份值交出去 */}
      <XhFormRoot
        readOnly
        defaultValues={{ token: "xh-0f2a" }}
        style={{ inlineSize: "260px" }}
        onSubmit={onSubmit}
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

      <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${submitted}`}</p>
    </>
  );
}
