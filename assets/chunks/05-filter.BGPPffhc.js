var e=`// 关键词过滤 | collection 换一份树即换一棵：标记跟随数据重新铺设，过滤后剩余的分支一并全部展开
import type { ReactNode } from "react";
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeEmpty,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/react";
import { useState } from "react";

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

// 分支名命中就整枝留下，否则只留命中的子节点；一个子节点都不剩的分支整枝去掉
function filterRegions(keyword: string): Region[] {
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
  const [expanded, setExpanded] = useState<string[]>(["east"]);

  const collection = filterRegions(keyword);

  function onKeyword(next: string): void {
    setKeyword(next);
    setExpanded(filterRegions(next).map(region => region.value));
  }

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <XhTextFieldRoot
        type="search"
        placeholder="输入城市名"
        clearable
        value={keyword}
        onValueChange={details => onKeyword(details.value)}
      >
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="城市关键词" />
          <XhTextFieldClearTrigger />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTreeRoot
        expandedValue={expanded}
        onExpandedValueChange={details => setExpanded(details.value)}
        collection={collection}
      >
        <XhTreeLabel>投放城市</XhTreeLabel>
        <XhTreeTree>
          {collection.map(region => (
            <XhTreeBranch key={region.value} value={region.value}>
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchText>{region.label}</XhTreeBranchText>
                <XhTreeItemIndicator />
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {region.children.map(city => (
                  <XhTreeItem key={city.value} value={city.value}>
                    <XhTreeItemText>{city.label}</XhTreeItemText>
                    <XhTreeItemIndicator />
                  </XhTreeItem>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
        {/* 空态占位：给了 collection 时由组件按剩下几枝收放 */}
        <XhTreeEmpty>{\`没有匹配「\${keyword}」的城市\`}</XhTreeEmpty>
      </XhTreeRoot>
    </div>
  );
}
`;export{e as default};