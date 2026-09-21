// 基础用法 | root 持有状态，label 与 control 中的 input 各自向它取属性；不传 value 即为非受控，组件自行维护值
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
    <XhTextFieldRoot name="email" type="email" placeholder="输入你的邮箱" clearable>
      <XhTextFieldLabel>邮箱</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput />
        <XhTextFieldClearTrigger />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  );
}
