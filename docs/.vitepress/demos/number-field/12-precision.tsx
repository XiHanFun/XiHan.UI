// 固定小数位 | 步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数
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
  const [price, setPrice] = useState("12.50");

  // 补齐两位小数；空值与非法值一律留空
  function pad(): void {
    setPrice((current) => {
      const n = Number(current);
      return current === "" || !Number.isFinite(n) ? "" : n.toFixed(2);
    });
  }

  return (
    <XhNumberFieldRoot
      value={price}
      min={0}
      max={999}
      step={0.1}
      onValueChange={details => setPrice(details.value)}
    >
      <XhNumberFieldLabel>单价（每档 0.1）</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldInput onBlur={pad} />
        <XhNumberFieldDecrementTrigger onPointerUp={pad} />
        <XhNumberFieldIncrementTrigger onPointerUp={pad} />
      </XhNumberFieldControl>
      <span>{`当前：${price || "（空）"}`}</span>
    </XhNumberFieldRoot>
  );
}
