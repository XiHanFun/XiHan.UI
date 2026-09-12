// 分步校验 | 校验函数每次提交现读一次：闭住当前这一步，提交就只校验这一步的字段；存草稿走的是普通按钮，一条规则都不跑
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
import { useState } from "react";

const steps = [
  {
    title: "第 1 步 · 联系人",
    fields: [
      { name: "name", label: "姓名" },
      { name: "phone", label: "手机" },
    ],
  },
  {
    title: "第 2 步 · 任职",
    fields: [
      { name: "company", label: "公司" },
      { name: "title", label: "职位" },
    ],
  },
];

function ruleOf(name: string, text: string): string {
  if (!text.trim())
    return "这一项不能为空";
  if (name === "phone" && !/^\d{11}$/.test(text.trim()))
    return "手机号要 11 位数字";
  return "";
}

export default function Demo(): ReactNode {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("（还没存过）");
  const [done, setDone] = useState("");
  const current = steps[step] ?? steps[0]!;
  const isLast = step === steps.length - 1;

  // 只返回当前这一步的字段，别的步骤这一次不参与
  function validate(values: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of current.fields)
      errors[field.name] = ruleOf(field.name, String(values[field.name] ?? ""));
    return errors;
  }

  // 这一步过了才走到这里：不是最后一步就往下推一步
  function onSubmit(details: { values: Record<string, unknown> }): void {
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    setDone(JSON.stringify(details.values));
  }

  function saveDraft(values: Record<string, unknown>): void {
    setDraft(JSON.stringify(values));
  }

  return (
    <XhFormRoot
      defaultValues={{ name: "", phone: "", company: "", title: "" }}
      validate={validate}
      style={{ inlineSize: "320px" }}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <>
          <strong style={{ fontSize: "13px" }}>{current.title}</strong>

          {/* 上一步的字段容器这会儿并没渲染，值仍留在值表里 */}
          {current.fields.map(field => (
            <XhFormFieldGroup key={field.name} name={field.name}>
              {({ value, error, invalid, setValue }) => (
                <XhFieldRoot invalid={invalid} required>
                  <XhFieldLabel>{field.label}</XhFieldLabel>
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
          ))}

          <div style={{ display: "flex", gap: "8px" }}>
            <XhFormSubmitTrigger>{isLast ? "提交" : "下一步"}</XhFormSubmitTrigger>
            {/* 普通按钮不是提交键，点了不发提交，也就不跑校验 */}
            <XhButton variant="outline" onClick={() => saveDraft(values)}>存草稿</XhButton>
            {step > 0 ? <XhButton variant="ghost" onClick={() => setStep(step - 1)}>上一步</XhButton> : null}
          </div>

          <p style={{ margin: 0, fontSize: "13px" }}>{`草稿：${draft}`}</p>
          {done ? <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${done}`}</p> : null}
        </>
      )}
    </XhFormRoot>
  );
}
