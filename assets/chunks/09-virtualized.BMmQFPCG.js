const o=`// 候选虚拟化 | 过滤后的完整 collection 与 count 同步，高亮仍可跨窗口移动
import type { CSSProperties, ReactNode } from "react";
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

const cities = Array.from({ length: 1000 }, (_, index) => ({ value: \`city-\${index + 1}\`, label: \`城市 \${index + 1}\` }));
const contentStyle: CSSProperties = { overflow: "visible", maxBlockSize: "none" };
const viewportStyle: CSSProperties = { blockSize: 240 };
const itemStyle: CSSProperties = { blockSize: 36 };

export default function Demo(): ReactNode {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => cities.filter(city => city.label.includes(query.trim())), [query]);
  return (
    <XhVirtualizerRoot count={filtered.length} estimateSize={36} viewportTabIndex={-1}>
      {({ virtualItems, collectionVirtualizer }) => (
        <XhComboboxRoot collection={filtered} virtualizer={collectionVirtualizer} inputValue={query} onInputValueChange={details => setQuery(details.inputValue)} openOnClick placeholder="搜索城市">
          <XhComboboxLabel>城市</XhComboboxLabel>
          <XhComboboxControl>
            <XhComboboxInput />
            <XhComboboxTrigger />
          </XhComboboxControl>
          <XhComboboxPositioner>
            <XhComboboxContent style={contentStyle}>
              <XhVirtualizerViewport style={viewportStyle}>
                <XhVirtualizerContent>
                  {virtualItems.map(virtualItem => (
                    <XhVirtualizerItem key={virtualItem.key} value={virtualItem.index} style={itemStyle}>
                      <XhComboboxItem value={filtered[virtualItem.index]!.value}>
                        <XhComboboxItemText>{filtered[virtualItem.index]!.label}</XhComboboxItemText>
                        <XhComboboxItemIndicator />
                      </XhComboboxItem>
                    </XhVirtualizerItem>
                  ))}
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhComboboxContent>
            <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
          </XhComboboxPositioner>
        </XhComboboxRoot>
      )}
    </XhVirtualizerRoot>
  );
}
`;export{o as default};
