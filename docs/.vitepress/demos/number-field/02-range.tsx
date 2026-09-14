// 区间与步长 | 方向键走 step，PageUp 与 PageDown 走 largeStep，Home 与 End 取端点；贴到边界时对应按钮转灰
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
    <XhNumberFieldRoot defaultValue="10" min={0} max={20} step={2} largeStep={10}>
      {({ valueAsNumber, canIncrement, canDecrement }) => (
        <>
          <XhNumberFieldLabel>数量（0 – 20，每档 2）</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldInput />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
          <span>
            {`数值：${Number.isNaN(valueAsNumber) ? "（空）" : valueAsNumber} · `}
            {`可加：${canIncrement ? "是" : "否"} · 可减：${canDecrement ? "是" : "否"}`}
          </span>
        </>
      )}
    </XhNumberFieldRoot>
  );
}
