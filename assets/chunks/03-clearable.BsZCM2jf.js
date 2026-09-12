const e=`// 可清空与字数上限 | Control 把输入框与清空按钮圈进同一个框，clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断
import type { ReactNode } from "react";
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTextFieldRoot
      defaultValue="曦寒"
      placeholder="最多 10 个字符"
      maxLength={10}
      clearable
    >
      {({ value, atLimit }) => (
        <>
          <XhTextFieldLabel>昵称</XhTextFieldLabel>
          <XhTextFieldControl style={{ inlineSize: "200px" }}>
            <XhTextFieldInput />
            <XhTextFieldClearTrigger />
          </XhTextFieldControl>
          <span>{\`\${value.length} / 10\${atLimit ? "（已到上限）" : ""}\`}</span>
        </>
      )}
    </XhTextFieldRoot>
  );
}
`;export{e as default};
