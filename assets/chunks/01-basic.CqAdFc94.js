const e=`// 基础用法 | root 持有状态，label 与 control 里的 input 各自向它取属性；不传 value 即为非受控，组件自己维护值
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
      <XhTextFieldRoot placeholder="请输入昵称">
        <XhTextFieldLabel>昵称</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot defaultValue="曦寒">
        <XhTextFieldLabel>带初值</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
`;export{e as default};
