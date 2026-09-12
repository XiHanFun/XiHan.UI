const e=`// 声明式规则 | rules 按字段声明 required/min/max/pattern/type，一个字段多条规则首败即停；文案取 rule.message，再退 validateMessages 模板（{name}/{min}/{max} 现场代入）。组里的字段自取校验态：invalid 与必填星号都不用手接
import type { FormRules, FormValidateMessages } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const rules: FormRules = {
  username: [
    { required: true, message: "用户名不能为空" },
    { min: 3, max: 12 },
    { pattern: /^[a-z][a-z0-9-]*$/i, message: "只能用字母、数字与连字符，且以字母开头" },
  ],
  email: [
    { required: true, message: "邮箱不能为空" },
    { type: "email", message: "这不是一个合法邮箱" },
  ],
  age: { type: "integer", min: 1, max: 150 },
};

// 模板统一改成中文；rule.message 写了的仍然赢过它
const validateMessages: FormValidateMessages = {
  minLength: "{name} 至少 {min} 个字符",
  maxLength: "{name} 不能超过 {max} 个字符",
  minNumber: "{name} 不能小于 {min}",
  maxNumber: "{name} 不能大于 {max}",
  type: { integer: "{name} 得是整数" },
};

const fields = [
  { name: "username", label: "用户名", placeholder: "3-12 位，字母开头" },
  { name: "email", label: "邮箱", placeholder: "you@example.com" },
  { name: "age", label: "年龄", placeholder: "选填" },
];

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("（还没提交过）");

  function onSubmit(details: { values: Record<string, unknown> }): void {
    setSubmitted(JSON.stringify(details.values));
  }

  return (
    <XhFormRoot
      defaultValues={{ username: "", email: "", age: "" }}
      rules={rules}
      validateMessages={validateMessages}
      style={{ inlineSize: "320px", display: "grid", gap: "12px" }}
      onSubmit={onSubmit}
    >
      {fields.map(f => (
        <XhFormFieldGroup key={f.name} name={f.name}>
          {({ value, setValue }) => (
            // Field 不接任何校验 props：invalid、必填星号与错误文案全部从表单上下文自取
            <XhFieldRoot>
              <XhFieldLabel>{f.label}</XhFieldLabel>
              <XhFieldControl>
                <input
                  placeholder={f.placeholder}
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldErrorText />
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>
      ))}

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <p style={{ margin: 0, fontSize: "13px" }}>{\`已提交：\${submitted}\`}</p>
    </XhFormRoot>
  );
}
`;export{e as default};
