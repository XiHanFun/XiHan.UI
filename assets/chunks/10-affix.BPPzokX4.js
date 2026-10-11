var e=`// 框内单位与货币符号 | 前后缀图标/文字直接以流式插入 control，减、加按钮统一收在右侧
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldPrefix,
  XhNumberFieldRoot,
  XhNumberFieldSuffix,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhNumberFieldRoot defaultValue="99" min={0} max={9999}>
        <XhNumberFieldLabel>单价</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldPrefix>¥</XhNumberFieldPrefix>
          <XhNumberFieldInput />
          <XhNumberFieldSuffix>元</XhNumberFieldSuffix>
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>

      <XhNumberFieldRoot defaultValue="500" min={0} max={5000} step={50}>
        <XhNumberFieldLabel>重量</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput />
          <XhNumberFieldSuffix>g</XhNumberFieldSuffix>
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>
    </>
  );
}
`;export{e as default};