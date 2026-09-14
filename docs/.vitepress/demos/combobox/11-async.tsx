// 异步候选 | 查询远程数据
import type { ReactNode } from "react";
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxLoading,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/react";
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
  const [options, setOptions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(0);

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
    <XhComboboxRoot collection={options} loading={loading} onInputValueChange={onSearch}>
      <XhComboboxLabel>城市</XhComboboxLabel>
      <XhComboboxControl>
        <XhComboboxInput placeholder="搜索城市" />
        <XhComboboxClearTrigger />
        <XhComboboxTrigger />
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          {options.map(city => (
            <XhComboboxItem key={city.value} value={city.value}>
              <XhComboboxItemText>{city.label}</XhComboboxItemText>
              <XhComboboxItemIndicator />
            </XhComboboxItem>
          ))}
        </XhComboboxContent>
        <XhComboboxLoading>查询中…</XhComboboxLoading>
        <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  );
}
