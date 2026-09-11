// 提醒但不拦下 | 可疑的值只在描述里提醒一句，不写进错误表：控件的 aria-invalid 仍是 false，提交照样放行
import type { CSSProperties, ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

const personal = ["qq.com", "163.com", "gmail.com"];

// 拦得住的只有格式这一条，它才进错误表
function validate(source: Record<string, unknown>): Record<string, string> {
  return {
    email: String(source.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
  };
}

// 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色
const warningStyle = {
  "--xh-field-control-border": "var(--xh-_tone-soft)",
  "--xh-field-description-fg": "var(--xh-_tone-fg)",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [values, setValues] = useState<Record<string, unknown>>({ email: "zhaifanhua@qq.com" });
  const [submitted, setSubmitted] = useState("（还没提交过）");

  // 提醒由值现算，与错误表无关
  const warning = useMemo(() => {
    const text = String(values.email ?? "");
    const domain = text.slice(text.indexOf("@") + 1).toLowerCase();
    return text.includes("@") && personal.includes(domain)
      ? "这是个人邮箱，同事之间通常填公司邮箱"
      : "";
  }, [values]);

  function onSubmit(details: { values: Record<string, unknown> }): void {
    setSubmitted(String(details.values.email ?? ""));
  }

  return (
    <XhFormRoot
      values={values}
      onValuesChange={details => setValues(details.values)}
      defaultValues={{ email: "zhaifanhua@qq.com" }}
      validate={validate}
      style={{ inlineSize: "320px" }}
      onSubmit={onSubmit}
    >
      <XhFormFieldGroup name="email">
        {({ value, error, invalid, setValue }) => (
          <XhFieldRoot
            invalid={invalid}
            data-tone={!invalid && warning ? "warning" : undefined}
            style={!invalid && warning ? warningStyle : undefined}
          >
            <XhFieldLabel>邮箱</XhFieldLabel>
            <XhFieldControl>
              <input
                type="email"
                value={value as string}
                onInput={event => setValue((event.target as HTMLInputElement).value)}
              />
            </XhFieldControl>
            {/* 描述恒在描述链里：提醒会被念出来，又不会把控件标成无效 */}
            <XhFieldDescription>{warning || "用于接收账单与安全提醒"}</XhFieldDescription>
            <XhFieldErrorText>{error}</XhFieldErrorText>
          </XhFieldRoot>
        )}
      </XhFormFieldGroup>

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${submitted}`}</p>
    </XhFormRoot>
  );
}
