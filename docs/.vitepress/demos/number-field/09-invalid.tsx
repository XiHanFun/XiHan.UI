// 校验态 | invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const stock = 5;

export default function Demo(): ReactNode {
  const [qty, setQty] = useState(8);

  return (
    <XhNumberFieldRoot
      defaultValue="8"
      min={1}
      max={99}
      invalid={qty > stock}
      onValueChange={details => setQty(details.valueAsNumber)}
    >
      <XhNumberFieldLabel>购买数量</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldInput />
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
      <span>{qty > stock ? `库存只有 ${stock} 件` : "库存充足"}</span>
    </XhNumberFieldRoot>
  );
}
