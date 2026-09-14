// 分组 | 按分类组织候选项
import type { ReactNode } from "react";
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxGroup,
  XhComboboxGroupLabel,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === ""
    ? groups
    : groups
        .map(g => ({ ...g, items: g.items.filter(c => c.label.toLowerCase().includes(q)) }))
        .filter(g => g.items.length > 0);

  return (
    <XhComboboxRoot
      inputValue={query}
      onInputValueChange={details => setQuery(details.inputValue)}
      openOnClick
      placeholder="搜索城市"
    >
      <XhComboboxLabel>城市</XhComboboxLabel>
      <XhComboboxControl>
        <XhComboboxInput />
        <XhComboboxTrigger />
        <XhComboboxClearTrigger />
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          {filtered.map(g => (
            <XhComboboxGroup key={g.value} value={g.value}>
              <XhComboboxGroupLabel>{g.label}</XhComboboxGroupLabel>
              {g.items.map(c => (
                <XhComboboxItem key={c.value} value={c.value}>
                  <XhComboboxItemText>{c.label}</XhComboboxItemText>
                  <XhComboboxItemIndicator />
                </XhComboboxItem>
              ))}
            </XhComboboxGroup>
          ))}
        </XhComboboxContent>
        <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  );
}
