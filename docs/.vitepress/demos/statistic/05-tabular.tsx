// 等宽数字 | 数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪
import type { ReactNode } from "react";
import {
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
    setAmount(`${digit()},${digit()}${digit()}${digit()}.${digit()}${digit()}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <XhStatisticRoot>
        <XhStatisticLabel>今日成交额</XhStatisticLabel>
        <XhStatisticValue>{amount}</XhStatisticValue>
        <XhStatisticSuffix>元</XhStatisticSuffix>
      </XhStatisticRoot>

      <button type="button" onClick={reroll}>换一组数字</button>
    </div>
  );
}
