const e=`// 网格排布 | columns 给列数、窄视口自动收成一列；字段自报 span 跨列，span="full" 占满整行且跟着当下列数走
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

const fields = [
  { name: "name", label: "姓名", placeholder: "必填" },
  { name: "phone", label: "手机号", placeholder: "11 位数字" },
  { name: "company", label: "公司", placeholder: "选填" },
  { name: "title", label: "职位", placeholder: "选填" },
  { name: "address", label: "通讯地址", placeholder: "选填", span: "full" as const },
];

const rules = {
  name: { required: true, message: "姓名不能为空" },
  phone: { required: true, message: "手机号不能为空" },
};

export default function Demo(): ReactNode {
  return (
    <XhFormRoot
      layout="grid"
      columns={{ base: 1, md: 2 }}
      rules={rules}
      defaultValues={{ name: "", phone: "", company: "", title: "", address: "" }}
      style={{ inlineSize: "100%" }}
    >
      {fields.map(f => (
        <XhFormFieldGroup key={f.name} name={f.name} span={f.span}>
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

      {/* 按钮不是字段，它是网格里的普通一格：想让它自己占一行就写 grid-column */}
      <XhFormSubmitTrigger style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
        提交
      </XhFormSubmitTrigger>
    </XhFormRoot>
  );
}
`;export{e as default};
