// 选中后清空输入 | 选中值一变就把输入串清掉，候选立刻回到全集，接着挑下一个不用先删字
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
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
  const picked = cities.find(c => c.value === value[0]) ?? null;

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={(details) => {
          setValue(details.value);
          // 输入串受控，选中值一落地就把它清成空串
          setQuery("");
        }}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={filtered}
        clearable
        label="城市"
        empty="无匹配城市"
        openOnClick
        placeholder="选完接着挑下一个"
      />
      <p>{`当前值：${picked?.label ?? "（未选）"}`}</p>
    </>
  );
}
