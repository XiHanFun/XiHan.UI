var e=`// 可清空与字数上限 | Control 把输入框与清空按钮圈进同一个框，clearable 使清空按钮可用并接管 Escape，maxLength 按字素计（一个组合 emoji 算一个字），超出的部分从新打进来的文字里截掉
import type { ReactNode } from "react";
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldCount,
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
      showCount
    >
      <XhTextFieldLabel>昵称</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput />
        <XhTextFieldClearTrigger />
      </XhTextFieldControl>
      {/* 字数按字素计，顶到上限换色 */}
      <XhTextFieldCount />
    </XhTextFieldRoot>
  );
}
`;export{e as default};