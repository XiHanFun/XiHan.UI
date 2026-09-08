// 加减钮排布 | 触发器位置由作者写模板决定：放进 control 即减在左、加在右、输入框居中的一体式，不写 control 则照旧三件并排
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
      <XhNumberFieldRoot defaultValue="1" min={0} max={9}>
        <XhNumberFieldLabel>一体式（control）</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>

      <XhNumberFieldRoot defaultValue="1" min={0} max={9}>
        <XhNumberFieldLabel>三件并排（不写 control）</XhNumberFieldLabel>
        <div style={{ display: "flex", gap: "4px" }}>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput style={{ inlineSize: "80px", textAlign: "center" }} />
          <XhNumberFieldIncrementTrigger />
        </div>
      </XhNumberFieldRoot>
    </>
  );
}
