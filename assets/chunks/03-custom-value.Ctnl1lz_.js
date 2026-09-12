const e=`// 允许自由文本 | allow-custom-value 让没匹配上候选的输入也能落值，适合标签、邮箱这类开放集合
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? frameworks : frameworks.filter(f => f.label.toLowerCase().includes(q));

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={filtered}
        clearable
        label="技术栈"
        empty="没有候选，按 Enter 直接用这串文本"
        allowCustomValue
        placeholder="选一个或直接打字"
      />
      <p>{\`当前值：\${value[0] ?? "（未选）"}\`}</p>
    </>
  );
}
`;export{e as default};
