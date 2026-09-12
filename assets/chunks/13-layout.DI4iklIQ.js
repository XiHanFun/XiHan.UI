const e=`// 排布 | layout 四档：vertical 竖排（默认）、horizontal 标签左置两列（labelWidth 统一列宽、labelAlign 换对齐缘）、inline 横排一行流、grid 等宽列的网格（columns 给列数）；整表排布一个开关搞定，不必逐字段写栅格
import type { FormLayout } from "@xihan-ui/headless";
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

const layouts: FormLayout[] = ["vertical", "horizontal", "inline", "grid"];

const fields = [
  { name: "username", label: "用户名", placeholder: "字母开头" },
  { name: "email", label: "邮箱", placeholder: "you@example.com" },
  { name: "city", label: "所在城市", placeholder: "选填" },
];

const rules = {
  username: { required: true, message: "用户名不能为空" },
  email: { required: true, message: "邮箱不能为空" },
};

export default function Demo(): ReactNode {
  const [layout, setLayout] = useState<FormLayout>("horizontal");

  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" }}>
        排布
        <select value={layout} onChange={event => setLayout(event.target.value as FormLayout)}>
          {layouts.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      <XhFormRoot
        layout={layout}
        columns={{ base: 1, md: 2 }}
        labelWidth={96}
        rules={rules}
        defaultValues={{ username: "", email: "", city: "" }}
        style={{ inlineSize: "100%", maxInlineSize: "460px" }}
      >
        {fields.map(f => (
          <XhFormFieldGroup key={f.name} name={f.name}>
            {({ value, setValue }) => (
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
      </XhFormRoot>
    </div>
  );
}
`;export{e as default};
