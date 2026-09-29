const e=`// 多选 | 已选城市在输入框前排成标签
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["beijing", "chengdu"]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));

  return (
    <XhComboboxRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      inputValue={query}
      onInputValueChange={details => setQuery(details.inputValue)}
      collection={filtered}
      clearable
      label="常去城市"
      empty="无匹配城市"
      multiple
      placeholder="搜索城市"
    />
  );
}
`;export{e as default};
