const e=`// 字段联动重验 | 确认密码的规则声明 deps: ['password']：先填确认密码并离开，之后再改密码，确认密码会跟着重新校验
import type { FormRules } from "@xihan-ui/headless";
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

const rules: FormRules = {
  password: { required: true, message: "请填写密码" },
  // validator 的第二个参数读得到密码的新值；deps 让密码一改就重验这一条
  confirm: {
    validator: (value, values) => (value !== values.password ? "两次输入的密码不一致" : undefined),
    deps: ["password"],
  },
};

const fields = [
  { name: "password", label: "密码" },
  { name: "confirm", label: "确认密码" },
];

export default function Demo(): ReactNode {
  return (
    <XhFormRoot
      defaultValues={{ password: "", confirm: "" }}
      rules={rules}
      validateOn="blur"
      style={{ inlineSize: "320px", display: "grid", gap: "12px" }}
    >
      {fields.map(f => (
        <XhFormFieldGroup key={f.name} name={f.name}>
          {({ value, setValue }) => (
            <XhFieldRoot>
              <XhFieldLabel>{f.label}</XhFieldLabel>
              <XhFieldControl>
                <input
                  type="password"
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
  );
}
`;export{e as default};
