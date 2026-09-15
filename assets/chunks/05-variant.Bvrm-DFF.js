const e=`// 形态 | variant 只改皮肤怎么用颜色，加减与键盘行为三档完全一致
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {variants.map(v => (
        <XhNumberFieldRoot key={v} variant={v} defaultValue="1">
          <XhNumberFieldLabel>{v}</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldInput />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
        </XhNumberFieldRoot>
      ))}
    </div>
  );
}
`;export{e as default};
