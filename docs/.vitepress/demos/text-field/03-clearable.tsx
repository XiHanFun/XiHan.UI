// 可清空与字数上限 | Control 把输入框与清空按钮圈进同一个框，clearable 使清空按钮可用并接管 Escape，maxLength 同时写为原生 maxlength 与状态机侧截断
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
          <XhTextFieldControl>
            <XhTextFieldInput />
            <XhTextFieldClearTrigger />
          </XhTextFieldControl>
          <span>{`${value.length} / 10${atLimit ? "（已到上限）" : ""}`}</span>
        </>
      )}
    </XhTextFieldRoot>
  );
}
