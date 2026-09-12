const t=`// 尺寸档 | 前后缀块跟着组内控件自己的档走，组上不必把同一档再写一遍
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
    <>
      <XhInputGroupRoot>
        <XhInputGroupItem>￥</XhInputGroupItem>
        <XhTextFieldRoot size="sm" placeholder="0.00">
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhInputGroupRoot>

      <XhInputGroupRoot>
        <XhInputGroupItem>￥</XhInputGroupItem>
        <XhTextFieldRoot size="lg" placeholder="0.00">
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhInputGroupRoot>
    </>
  );
}
`;export{t as default};
