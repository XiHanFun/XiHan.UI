// 级联勾选 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；勾选框是行里的一段标记，勾选态与半选态都由组件报出
import type { ReactNode } from "react";
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/react";
import { useState } from "react";

const collection = [
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
];

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState<string[]>(["hz"]);

  return (
    <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
      <XhTreeRoot
        selection={selected}
        onSelectionChange={details => setSelected(details.value)}
        collection={collection}
        defaultExpandedValue={["east", "north"]}
        multiple
        cascade
      >
        <XhTreeLabel>投放城市</XhTreeLabel>
        <XhTreeTree>
          {collection.map(region => (
            <XhTreeBranch key={region.value} value={region.value}>
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchCheckbox />
                <XhTreeBranchText>{region.label}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {region.children.map(city => (
                  <XhTreeItem key={city.value} value={city.value}>
                    <XhTreeItemCheckbox />
                    <XhTreeItemText>{city.label}</XhTreeItemText>
                  </XhTreeItem>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
      </XhTreeRoot>
      <p>{`选中值（默认只收叶）：${selected.length ? selected.join("、") : "（无）"}`}</p>
    </div>
  );
}
