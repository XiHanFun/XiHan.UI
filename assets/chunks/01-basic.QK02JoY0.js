const t=`// 基础用法 | 前后缀与输入框拼成一个盒：中缝合成一条，圆角只留在两端
import type { ReactNode } from "react";
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhInputGroupRoot>
      <XhInputGroupItem>https://</XhInputGroupItem>
      <XhTextFieldRoot placeholder="xihanfun">
        <XhTextFieldControl>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <XhInputGroupItem>.com</XhInputGroupItem>
    </XhInputGroupRoot>
  );
}
`;export{t as default};
