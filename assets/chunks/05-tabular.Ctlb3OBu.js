var e=`// 等宽数字 | 数值使用等宽数字排版，反复更换数值时字宽不变，后面的单位不会左右移动
import type { ReactNode } from "react";
import {
  XhButton,
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [amount, setAmount] = useState("1,111.11");

  // 每次换一组随机数字，位数固定，只有字形在变
  function reroll(): void {
    const digit = (): string => String(Math.floor(Math.random() * 10));
    setAmount(\`\${digit()},\${digit()}\${digit()}\${digit()}.\${digit()}\${digit()}\`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <XhStatisticRoot>
        <XhStatisticLabel>今日成交额</XhStatisticLabel>
        <XhStatisticValue>{amount}</XhStatisticValue>
        <XhStatisticSuffix>元</XhStatisticSuffix>
      </XhStatisticRoot>

      <XhButton variant="outline" size="sm" onClick={reroll}>换一组数字</XhButton>
    </div>
  );
}
`;export{e as default};