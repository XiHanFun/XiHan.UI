var e=`// 受控 | 传入 value 后由宿主决定；值可以是 null，表示没有任何一项选中
import type { ReactNode } from "react";
import {
  XhButton,
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
      <XhButton variant="outline" size="sm" onClick={() => setPlan(null)}>清空</XhButton>
      <span data-demo-output>{\`当前：\${plan ?? "（未选）"}\`}</span>
    </>
  );
}
`;export{e as default};