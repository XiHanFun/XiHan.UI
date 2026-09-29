const e=`// 异步加载子节点 | 展开时才请求数据：请求在途的分支写进 loadingValue，展开箭头换成转圈并报告 aria-busy；取回后写回 collection 并移出，收起再展开不重复请求
import type { ReactNode } from "react";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

// 空数组也是分支：还没取回子项的部门照样报告 aria-expanded；没有 children 的是叶子，不用取
const initial: Node[] = [
  { value: "rd", label: "研发中心", children: [] },
  { value: "ops", label: "运维中心", children: [] },
  { value: "biz", label: "业务中心", children: [] },
  { value: "board", label: "董事办" },
];

const staff: Record<string, string[]> = {
  rd: ["赵一", "钱二"],
  ops: ["孙三"],
  biz: ["李四", "周五", "吴六"],
};

export default function Demo(): ReactNode {
  const [collection, setCollection] = useState<Node[]>(initial);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const loaded = useRef(new Set<string>());

  // 这里用定时器代替一次请求
  function fetchChildren(value: string): void {
    if (loaded.current.has(value))
      return;
    loaded.current.add(value);
    setLoading(current => [...current, value]);
    window.setTimeout(() => {
      const names = staff[value] ?? [];
      setCollection(current => current.map(node => (node.value === value
        ? { ...node, children: names.map((name, index) => ({ value: \`\${value}-\${index}\`, label: name })) }
        : node)));
      setLoading(current => current.filter(item => item !== value));
    }, 800);
  }

  function onExpandedValueChange(details: { value: string[] }): void {
    setExpanded(details.value);
    for (const value of details.value) fetchChildren(value);
  }

  return (
    <XhTreeRoot
      collection={collection}
      expandedValue={expanded}
      loadingValue={loading}
      style={{ inlineSize: "100%", maxInlineSize: "320px" }}
      onExpandedValueChange={onExpandedValueChange}
    >
      <XhTreeLabel>组织架构</XhTreeLabel>
      <XhTreeTree>
        {collection.map(node => (node.children
          ? (
              <XhTreeBranch key={node.value} value={node.value}>
                <XhTreeBranchControl>
                  <XhTreeBranchTrigger />
                  <XhTreeBranchText>{node.label}</XhTreeBranchText>
                  <XhTreeItemIndicator />
                </XhTreeBranchControl>
                <XhTreeBranchContent>
                  {node.children.map(child => (
                    <XhTreeItem key={child.value} value={child.value}>
                      <XhTreeItemText>{child.label}</XhTreeItemText>
                      <XhTreeItemIndicator />
                    </XhTreeItem>
                  ))}
                </XhTreeBranchContent>
              </XhTreeBranch>
            )
          : (
              <XhTreeItem key={node.value} value={node.value}>
                <XhTreeItemText>{node.label}</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
            )))}
      </XhTreeTree>
    </XhTreeRoot>
  );
}
`;export{e as default};
