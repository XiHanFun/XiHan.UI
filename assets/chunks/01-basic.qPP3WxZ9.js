const e=`// 基础用法 | 过滤由宿主自己算：组件把输入串交出来，此刻显示哪几条候选由调用方定
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={filtered}
        clearable
        label="城市"
        empty="无匹配城市"
        openOnClick
        placeholder="输入城市名筛选"
      />
      <p>{\`当前值：\${value[0] ?? "（未选）"}\`}</p>
    </>
  );
}
`;export{e as default};
