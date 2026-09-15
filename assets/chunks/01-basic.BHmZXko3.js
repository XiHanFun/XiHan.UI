const r=`// 基础用法 | 提交并校验表单
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

function validate(values: Record<string, unknown>): Record<string, string> {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}

export default function Demo(): ReactNode {
  return (
    <XhFormRoot
      defaultValues={{ email: "", nickname: "" }}
      validate={validate}
      style={{ inlineSize: "320px" }}
    >
      <XhFormErrorSummary>
        {({ errorCount }) => (
          <>
            <span>{\`共 \${errorCount} 处需要修改\`}</span>
            <XhFormErrorSummaryItem name="email">{({ error }) => error}</XhFormErrorSummaryItem>
            <XhFormErrorSummaryItem name="nickname">{({ error }) => error}</XhFormErrorSummaryItem>
          </>
        )}
      </XhFormErrorSummary>

      <XhFormFieldGroup name="email">
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

      <XhFormFieldGroup name="nickname">
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
    </XhFormRoot>
  );
}
`;export{r as default};
