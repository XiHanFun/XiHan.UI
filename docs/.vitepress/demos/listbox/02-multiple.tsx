// 多选 | selection-mode="multiple" 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选
import type { ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const options = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [cities, setCities] = useState<string[]>(["beijing", "london"]);

  return (
    <>
      <XhListboxRoot
        value={cities}
        onValueChange={details => setCities(details.value)}
        collection={options}
        label="常去城市"
        selectionMode="multiple"
        style={{ maxInlineSize: "320px" }}
      />
      <p>{`已选：${cities.length ? cities.join("、") : "（无）"}`}</p>
    </>
  );
}
