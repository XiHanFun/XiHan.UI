// 基础用法 | 方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位
import type { ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [city, setCity] = useState<string[]>(["beijing"]);

  return (
    <>
      <XhListboxRoot
        value={city}
        onValueChange={details => setCity(details.value)}
        collection={cities}
        label="城市"
        style={{ maxInlineSize: "320px" }}
      />
      <p>{`已选：${city.length ? city.join("、") : "（无）"}`}</p>
    </>
  );
}
