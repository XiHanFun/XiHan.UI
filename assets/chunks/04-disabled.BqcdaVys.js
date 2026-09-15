const e=`// 禁用与只读 | 两者都改不动值，禁用还会把加减按钮一并关掉、值也不再随表单提交
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
    <>
      <XhNumberFieldRoot defaultValue="5" disabled>
        <XhNumberFieldLabel>禁用</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldInput />
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>

      <XhNumberFieldRoot defaultValue="5" readOnly>
        <XhNumberFieldLabel>只读</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldInput />
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>
    </>
  );
}
`;export{e as default};
