const e=`// 原生属性 | 写在 input 部件上的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhTextFieldRoot placeholder="you@example.com">
        <XhTextFieldLabel>邮箱</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "220px" }}>
          <XhTextFieldInput
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
          />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot placeholder="11 位手机号" maxLength={11}>
        <XhTextFieldLabel>手机号</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "220px" }}>
          <XhTextFieldInput
            autoComplete="tel"
            inputMode="numeric"
            enterKeyHint="done"
          />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
`;export{e as default};
