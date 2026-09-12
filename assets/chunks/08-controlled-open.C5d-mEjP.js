const e=`// 受控展开 | 传了 open 就由宿主说了算：组件只报展开意图，这里满两个字符才真的把浮层放出来
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [wantOpen, setWantOpen] = useState(false);

  // 组件的展开意图与输入长度两个条件都满足才展开
  const open = wantOpen && query.trim().length >= 2;
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
        open={open}
        label="城市"
        empty="无匹配城市"
        placeholder="至少输入两个字符"
        onOpenChange={details => setWantOpen(details.open)}
      />
      <p>{\`浮层：\${open ? "展开" : "收起"} · 当前值：\${value[0] ?? "（未选）"}\`}</p>
    </>
  );
}
`;export{e as default};
