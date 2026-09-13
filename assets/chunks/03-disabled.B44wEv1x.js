const e=`// 禁用 | 禁止编辑字段
import type { ReactNode } from "react";
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFieldRoot disabled style={{ inlineSize: "280px" }}>
      <XhFieldLabel>登录账号</XhFieldLabel>
      <XhFieldControl>
        <input defaultValue="zhaifanhua" disabled />
      </XhFieldControl>
      <XhFieldDescription>账号创建后不可更改</XhFieldDescription>
    </XhFieldRoot>
  );
}
`;export{e as default};
