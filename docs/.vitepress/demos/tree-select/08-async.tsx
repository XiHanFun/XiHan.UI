// 异步加载子节点 | 展开某个分支才去要它的子节点：先摆一行禁用占位，数据回来就地换掉，显示文本随之取到新 label
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Node {
  value: string;
  label: string;
  disabled?: boolean;
  children?: Node[];
}

// 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
function pending(owner: string): Node[] {
  return [{ value: `${owner}-pending`, label: "加载中…", disabled: true }];
}

const initial: Node[] = [
  { value: "east", label: "华东", children: pending("east") },
  { value: "north", label: "华北", children: pending("north") },
];

const cities: Record<string, string[]> = {
  east: ["上海", "杭州", "南京"],
  north: ["北京", "天津"],
};

export default function Demo(): ReactNode {
  const [collection, setCollection] = useState<Node[]>(initial);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const loaded = useRef(new Set<string>());

  function fetchChildren(value: string): void {
    if (loaded.current.has(value))
      return;
    loaded.current.add(value);
    window.setTimeout(() => {
      const children = (cities[value] ?? []).map((name, index) => ({
        value: `${value}-${index}`,
        label: name,
      }));
      setCollection(nodes => nodes.map(node => node.value === value ? { ...node, children } : node));
    }, 800);
  }

  function onExpandedValueChange(details: { value: string[] }): void {
    setExpanded(details.value);
    for (const value of details.value) fetchChildren(value);
  }

  return (
    <>
      <XhTreeSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={collection}
        expandedValue={expanded}
        placeholder="选一个城市"
        style={{ maxInlineSize: "320px" }}
        onExpandedValueChange={onExpandedValueChange}
      >
        <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
        <XhTreeSelectControl>
          <XhTreeSelectTrigger>
            <XhTreeSelectValueText />
            <XhTreeSelectIndicator />
          </XhTreeSelectTrigger>
        </XhTreeSelectControl>
        <XhTreeSelectPositioner>
          <XhTreeSelectContent>
            <XhTreeSelectTree>
              {collection.map(region => (
                <XhTreeSelectBranch key={region.value} value={region.value}>
                  <XhTreeSelectBranchControl>
                    <XhTreeSelectBranchTrigger />
                    <XhTreeSelectBranchText>{region.label}</XhTreeSelectBranchText>
                    <XhTreeSelectItemIndicator />
                  </XhTreeSelectBranchControl>
                  <XhTreeSelectBranchContent>
                    {region.children?.map(city => (
                      <XhTreeSelectItem key={city.value} value={city.value}>
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>{city.label}</XhTreeSelectItemText>
                      </XhTreeSelectItem>
                    ))}
                  </XhTreeSelectBranchContent>
                </XhTreeSelectBranch>
              ))}
            </XhTreeSelectTree>
          </XhTreeSelectContent>
        </XhTreeSelectPositioner>
      </XhTreeSelectRoot>
      <p>{`已选：${picked.length ? picked.join("、") : "（无）"}`}</p>
    </>
  );
}
