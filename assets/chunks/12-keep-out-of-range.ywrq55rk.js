var e=`// 保留越界值 | 关掉 clampValueOnBlur 后越界输入不再在失焦时被悄悄改掉，outOfRange 报出来交给宿主提示
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhNumberFieldRoot defaultValue="12" min={1} max={10} clampValueOnBlur={false}>
      {({ outOfRange }) => (
        <>
          <XhNumberFieldLabel>每周训练天数</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldInput />
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
          <span>{outOfRange ? "请填 1 到 10 之间的天数" : "范围 1 到 10"}</span>
        </>
      )}
    </XhNumberFieldRoot>
  );
}
`;export{e as default};