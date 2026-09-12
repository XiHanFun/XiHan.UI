const n=`// 异步候选 | 输入串每变一次就重新去远端查一遍，等结果的这段时间候选为空、由空态节点顶上
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useRef, useState } from "react";

interface City {
  value: string;
  label: string;
}

const pool: City[] = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [options, setOptions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(0);

  // 每次输入都重开一轮查询，上一轮未落地的先撤掉
  function onSearch(details: { inputValue: string }): void {
    window.clearTimeout(timer.current);
    const q = details.inputValue.trim().toLowerCase();
    setOptions([]);
    if (q === "") {
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setOptions(pool.filter(c => c.label.toLowerCase().includes(q)));
      setLoading(false);
    }, 600);
  }

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        collection={options}
        clearable
        label="城市"
        empty={loading ? "查询中…" : "无匹配城市"}
        placeholder="输入城市名查询"
        onInputValueChange={onSearch}
      />
      <p>{\`当前值：\${value[0] ?? "（未选）"}\`}</p>
    </>
  );
}
`;export{n as default};
