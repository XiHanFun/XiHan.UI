const e=`// 校验状态 | invalid 让输入行报 aria-invalid、描边转告警色；选出值后判定自己撤掉
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
  // 校验归宿主，组件只负责把这个结论铺成属性
  const invalid = value.length === 0;

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={filtered}
        clearable
        invalid={invalid}
        label="常驻城市"
        empty="无匹配城市"
        openOnClick
        placeholder="必须选一个城市"
      />
      {invalid && <p style={{ color: "var(--xh-fg-danger)" }}>这一项必填</p>}
    </>
  );
}
`;export{e as default};
