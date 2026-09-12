const e=`// 禁用 | Field 的 disabled 只把 data-disabled 铺到各部件上；真正改不动还得在自己的控件上落原生 disabled
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
