const e=`// 自定义换算 | parse 把显示串读成数、format 把数写回显示串；两个方向必须互逆，否则按一下加号值就会漂
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

// 千位分隔符：读的时候把逗号去掉，写的时候再加回来
const parseAmount = (text: string): number => Number(text.replace(/,/g, ""));
const formatAmount = (value: number): string => value.toLocaleString("en-US");

// 单位后缀同理：认得出后缀就读得出数
const parseWeight = (text: string): number => Number(text.replace(/\\s*kg$/i, ""));
const formatWeight = (value: number): string => \`\${value} kg\`;

export default function Demo(): ReactNode {
  const [amount, setAmount] = useState("1,234");
  const [weight, setWeight] = useState("60 kg");

  return (
    <>
      <XhNumberFieldRoot
        value={amount}
        min={0}
        max={99999}
        step={100}
        parse={parseAmount}
        format={formatAmount}
        onValueChange={details => setAmount(details.value)}
      >
        <XhNumberFieldLabel>金额（千位分隔）</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput style={{ inlineSize: "96px" }} />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>

      <XhNumberFieldRoot
        value={weight}
        min={0}
        max={200}
        step={5}
        parse={parseWeight}
        format={formatWeight}
        onValueChange={details => setWeight(details.value)}
      >
        <XhNumberFieldLabel>体重（带单位）</XhNumberFieldLabel>
        <XhNumberFieldControl>
          <XhNumberFieldDecrementTrigger />
          <XhNumberFieldInput style={{ inlineSize: "88px" }} />
          <XhNumberFieldIncrementTrigger />
        </XhNumberFieldControl>
      </XhNumberFieldRoot>

      {/* 输入途中一律不补格式，否则光标会被打断；手打 1500 要等失焦才变成 1,500 */}
      <span style={{ fontSize: "13px" }}>{\`金额：\${amount} · 体重：\${weight}\`}</span>
    </>
  );
}
`;export{e as default};
