const e=`// 多选 | 选完不收起、输入串自动清空，候选立刻回到全集；框里空着时退格删掉最后一个已选项
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

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={filtered}
        clearable
        label="常去城市"
        empty="无匹配城市"
        multiple
        placeholder="挑几个城市"
      />
      <p>{\`已选：\${value.length ? value.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
