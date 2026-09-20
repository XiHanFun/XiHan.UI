const t=`// 变体 | 设置浮动按钮的表面
import type { ActionVariant } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

const variants: ActionVariant[] = ["outline", "solid", "subtle", "ghost"];

export default function Demo(): ReactNode {
  return variants.map(variant => (
    <XhFloatButtonRoot key={variant} style={{ position: "static" }} variant={variant}>
      <XhFloatButtonTrigger />
      <XhFloatButtonList />
    </XhFloatButtonRoot>
  ));
}
`;export{t as default};
