// 受控 | 传了 value 就由宿主说了算；value-change 除了原始串还带一份 valueAsNumber
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

export default function Demo(): ReactNode {
  const [qty, setQty] = useState("3");
  const [asNumber, setAsNumber] = useState(3);

  return (
    <>
      <XhNumberFieldRoot
        value={qty}
        min={0}
        max={99}
        onValueChange={(details) => {
          setQty(details.value);
          setAsNumber(details.valueAsNumber);
        }}
      >
        <XhNumberFieldLabel>数量</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>
      <span>{`输入串：${qty === "" ? "（空）" : qty} · 数值：${asNumber}`}</span>
    </>
  );
}
