// 基础用法 | 搜索并选择城市
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
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));

  return (
    <XhComboboxRoot
      inputValue={query}
      onInputValueChange={details => setQuery(details.inputValue)}
      collection={filtered}
      clearable
      label="城市"
      empty="无匹配城市"
      openOnClick
      placeholder="搜索城市"
    />
  );
}
