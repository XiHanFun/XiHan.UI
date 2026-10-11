var e=`// 布局 | 设置纵向、横向、行内或网格布局
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
  XhRadioGroupRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const layouts = (["vertical", "horizontal", "inline", "grid"] as const).map(l => ({ value: l, label: l }));

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
      {/* 分段轨道里不排可见标题：label 只作可及名 */}
      <XhRadioGroupRoot
        variant="segmented"
        collection={layouts}
        value={layout}
        label="排布"
        onValueChange={details => setLayout(details.value as FormLayout)}
      />

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