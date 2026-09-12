const t=`// 搭动作钮 | 按钮作用在紧挨着它的那个输入框上，两段共用中缝那条边
import type { ReactNode } from "react";
import {
  XhButton,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhInputGroupRoot>
      <XhTextFieldRoot placeholder="搜索文档" clearable>
        <XhTextFieldControl>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <XhButton variant="solid">搜索</XhButton>
    </XhInputGroupRoot>
  );
}
`;export{t as default};
