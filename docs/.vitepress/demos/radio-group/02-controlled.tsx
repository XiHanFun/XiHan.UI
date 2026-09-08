// 受控 | 传了 value 就由宿主说了算；值可以是 null，表示一项都没选中
import type { ReactNode } from "react";
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [plan, setPlan] = useState<string | null>("free");

  return (
    <>
      <XhRadioGroupRoot value={plan} onValueChange={details => setPlan(details.value)}>
        <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
        <XhRadioGroupItem value="free">
          <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
        </XhRadioGroupItem>
        <XhRadioGroupItem value="standard">
          <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
        </XhRadioGroupItem>
      </XhRadioGroupRoot>
      <span>{`当前：${plan ?? "（未选）"}`}</span>
      <button type="button" onClick={() => setPlan(null)}>清空</button>
    </>
  );
}
