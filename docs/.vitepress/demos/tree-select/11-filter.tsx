// 浮层内关键词过滤 | 输入框是树的兄弟节点，树的键盘处理器挂在 tree 上，打字不会被连打检索收走；换掉 collection 可见行与方向键顺序跟着重算
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
import { useMemo, useState } from "react";

interface City {
  value: string;
  label: string;
}

interface Region {
  value: string;
  label: string;
  children: City[];
}

const source: Region[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
  {
    value: "south",
    label: "华南",
    children: [
      { value: "gz", label: "广州" },
      { value: "sz", label: "深圳" },
    ],
  },
];

// 分区名命中就整枝留下，否则只留命中的城市；一个都不剩的分区整枝去掉
function filter(keyword: string): Region[] {
  const key = keyword.trim();
  if (!key)
    return source;
  return source
    .map(region => ({
      ...region,
      children: region.label.includes(key)
        ? region.children
        : region.children.filter(city => city.label.includes(key)),
    }))
    .filter(region => region.children.length > 0);
}

export default function Demo(): ReactNode {
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);

  const collection = useMemo(() => filter(keyword), [keyword]);

  // 关键词一改，命中的分区全部摊开；清空又回到整棵树收起的样子
  function onKeywordChange(next: string): void {
    setKeyword(next);
    setExpanded(next.trim() ? filter(next).map(region => region.value) : []);
  }

  // 收起浮层顺手把关键词清掉，下次展开还是整棵树
  function onOpenChange(details: { open: boolean }): void {
    if (!details.open)
      onKeywordChange("");
  }

  return (
    <XhTreeSelectRoot
      expandedValue={expanded}
      onExpandedValueChange={details => setExpanded(details.value)}
      collection={collection}
      placeholder="选一个城市"
      style={{ maxInlineSize: "320px" }}
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
          {/* 浮层里的输入框不算点在外面，浮层不会因此收起 */}
          <input
            value={keyword}
            type="search"
            aria-label="城市关键词"
            placeholder="输入关键词"
            style={{ inlineSize: "100%", marginBlockEnd: "6px" }}
            onChange={event => onKeywordChange(event.target.value)}
          />
          <XhTreeSelectTree>
            {collection.map(region => (
              <XhTreeSelectBranch key={region.value} value={region.value}>
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>{region.label}</XhTreeSelectBranchText>
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  {region.children.map(city => (
                    <XhTreeSelectItem key={city.value} value={city.value}>
                      <XhTreeSelectItemIndicator />
                      <XhTreeSelectItemText>{city.label}</XhTreeSelectItemText>
                    </XhTreeSelectItem>
                  ))}
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
            ))}
          </XhTreeSelectTree>
          {collection.length
            ? null
            : (
                <p style={{ margin: 0, padding: "4px" }}>
                  {`没有匹配「${keyword}」的城市`}
                </p>
              )}
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  );
}
