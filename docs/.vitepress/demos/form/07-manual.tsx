// 跨字段规则与手动入口 | validate 拿到的是整张值表，可以写两个字段互相约束的规则；setFieldError 与 clearErrors 随时能单独动一条
import type { ReactNode } from "react";
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";

// 确认密码这一条要跟密码比，单看自己判不出来
function confirmError(values: Record<string, unknown>): string {
  const password = String(values.password ?? "");
  const confirm = String(values.confirm ?? "");
  if (confirm === "")
    return "请再输入一遍密码";
  return confirm === password ? "" : "两次输入不一致";
}

function validate(values: Record<string, unknown>): Record<string, string> {
  return {
    password: String(values.password ?? "").length >= 8 ? "" : "密码至少 8 位",
    confirm: confirmError(values),
  };
}

export default function Demo(): ReactNode {
  return (
    <XhFormRoot
      defaultValues={{ password: "", confirm: "" }}
      validate={validate}
      style={{ inlineSize: "320px" }}
    >
      {({ values, setFieldError, clearErrors }) => (
        <>
          <XhFormFieldGroup value="password">
            {({ value, error, invalid, setValue }) => (
              <XhFieldRoot invalid={invalid} required>
                <XhFieldLabel>密码</XhFieldLabel>
                <XhFieldControl>
                  <input
                    type="password"
                    value={value as string}
                    onInput={event => setValue((event.target as HTMLInputElement).value)}
                  />
                </XhFieldControl>
                <XhFieldErrorText>{error}</XhFieldErrorText>
              </XhFieldRoot>
            )}
          </XhFormFieldGroup>

          <XhFormFieldGroup value="confirm">
            {({ value, error, invalid, setValue }) => (
              <XhFieldRoot invalid={invalid} required>
                <XhFieldLabel>确认密码</XhFieldLabel>
                <XhFieldControl>
                  <input
                    type="password"
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
            {/* 只动确认密码这一条：给文案就写上，给空串就撤掉 */}
            <XhButton variant="outline" onClick={() => setFieldError("confirm", confirmError(values))}>
              只查确认密码
            </XhButton>
            <XhButton variant="ghost" onClick={() => clearErrors()}>清空错误</XhButton>
          </div>
        </>
      )}
    </XhFormRoot>
  );
}
