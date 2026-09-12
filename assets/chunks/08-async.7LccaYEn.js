const e=`// 首次全量加载与空集合 | 第一次展开才取整棵树；正式 Loading/Empty 与候选树互斥，状态文字不进入选值或键盘导航，底部按钮可重放有数据与零集合响应
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectEmpty,
  XhTreeSelectFooter,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectLoading,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const CITY_TREE: Node[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "east-shanghai", label: "上海" },
      { value: "east-hangzhou", label: "杭州" },
      { value: "east-nanjing", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "north-beijing", label: "北京" },
      { value: "north-tianjin", label: "天津" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [collection, setCollection] = useState<Node[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const requested = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  function load(mode: "cities" | "empty"): void {
    if (timer.current !== undefined)
      window.clearTimeout(timer.current);
    setLoading(true);
    setCollection([]);
    setExpanded([]);
    setPicked([]);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setCollection(mode === "cities" ? CITY_TREE : []);
      setLoading(false);
    }, 800);
  }

  function onOpenChange(details: { open: boolean }): void {
    if (!details.open || requested.current)
      return;
    requested.current = true;
    load("cities");
  }

  useEffect(() => () => {
    if (timer.current !== undefined)
      window.clearTimeout(timer.current);
  }, []);

  return (
    <>
      <XhTreeSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={collection}
        expandedValue={expanded}
        loading={loading}
        placeholder="选一个城市"
        style={{ maxInlineSize: "320px" }}
        onExpandedValueChange={details => setExpanded(details.value)}
        onOpenChange={onOpenChange}
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
                    {(region.children ?? []).map(city => (
                      <XhTreeSelectItem key={city.value} value={city.value}>
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>{city.label}</XhTreeSelectItemText>
                      </XhTreeSelectItem>
                    ))}
                  </XhTreeSelectBranchContent>
                </XhTreeSelectBranch>
              ))}
            </XhTreeSelectTree>
            <XhTreeSelectLoading>正在加载城市…</XhTreeSelectLoading>
            <XhTreeSelectEmpty>暂无可选城市</XhTreeSelectEmpty>
            <XhTreeSelectFooter>
              <button type="button" disabled={loading} onClick={() => load("cities")}>加载城市</button>
              <button type="button" disabled={loading} onClick={() => load("empty")}>加载空集合</button>
            </XhTreeSelectFooter>
          </XhTreeSelectContent>
        </XhTreeSelectPositioner>
      </XhTreeSelectRoot>
      <p>
        已选：
        {picked.length ? picked.join("、") : "（无）"}
      </p>
    </>
  );
}
`;export{e as default};
