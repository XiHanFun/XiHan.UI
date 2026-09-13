/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自定义值 | 选择候选项或输入新值
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

export default function Demo(): ReactNode {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? frameworks : frameworks.filter(f => f.label.toLowerCase().includes(q));

  return (
    <XhComboboxRoot
      inputValue={query}
      onInputValueChange={details => setQuery(details.inputValue)}
      collection={filtered}
      clearable
      label="技术栈"
      empty="按 Enter 使用当前输入"
      allowCustomValue
      placeholder="选择或输入技术栈"
    />
  );
}
