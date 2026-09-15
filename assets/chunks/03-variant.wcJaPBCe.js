const t=`// 变体 | 设置浮动按钮的表面
import type { ActionVariant } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

const variants: (ActionVariant | undefined)[] = [undefined, "solid", "subtle", "outline", "ghost"];

export default function Demo(): ReactNode {
  return variants.map(variant => (
    <XhFloatButtonRoot key={variant ?? "glass"} style={{ position: "static" }} variant={variant}>
      <XhFloatButtonTrigger />
      <XhFloatButtonList />
    </XhFloatButtonRoot>
  ));
}
`;export{t as default};
