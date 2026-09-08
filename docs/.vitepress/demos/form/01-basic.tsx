// 基础用法 | 默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

// 校验整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
function validate(values: Record<string, unknown>): Record<string, string> {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(details: { values: Record<string, unknown> }): void {
    setSubmitted(JSON.stringify(details.values));
  }

  return (
    <XhFormRoot
      defaultValues={{ email: "", nickname: "" }}
      validate={validate}
      style={{ inlineSize: "320px" }}
      onSubmit={onSubmit}
    >
      {/* 摘要只在提交失败后显形；条目一次全写上，谁露面由当下的错误表决定 */}
      <XhFormErrorSummary>
        {({ errorCount }) => (
          <>
            <span>{`共 ${errorCount} 处需要修改`}</span>
            <XhFormErrorSummaryItem value="email">{({ error }) => error}</XhFormErrorSummaryItem>
            <XhFormErrorSummaryItem value="nickname">{({ error }) => error}</XhFormErrorSummaryItem>
          </>
        )}
      </XhFormErrorSummary>

      <XhFormFieldGroup value="email">
        {({ value, error, invalid, setValue }) => (
          <XhFieldRoot invalid={invalid} required>
            <XhFieldLabel>邮箱</XhFieldLabel>
            <XhFieldControl>
              <input
                type="email"
                placeholder="you@example.com"
                value={value as string}
                onInput={event => setValue((event.target as HTMLInputElement).value)}
              />
            </XhFieldControl>
            <XhFieldErrorText>{error}</XhFieldErrorText>
          </XhFieldRoot>
        )}
      </XhFormFieldGroup>

      <XhFormFieldGroup value="nickname">
        {({ value, error, invalid, setValue }) => (
          <XhFieldRoot invalid={invalid} required>
            <XhFieldLabel>昵称</XhFieldLabel>
            <XhFieldControl>
              <input
                value={value as string}
                onInput={event => setValue((event.target as HTMLInputElement).value)}
              />
            </XhFieldControl>
            <XhFieldErrorText>{error}</XhFieldErrorText>
          </XhFieldRoot>
        )}
      </XhFormFieldGroup>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
        <XhFormResetTrigger>重置</XhFormResetTrigger>
      </div>

      {submitted ? <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${submitted}`}</p> : null}
    </XhFormRoot>
  );
}
