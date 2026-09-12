const e=`// 末端横排 | leaf-orientation 按结构判据横排「子节点全是叶子」的那层；要指定哪一层横排就在节点上标 childrenOrientation，它比树级值优先，标 vertical 也压得住
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
    value: "system",
    label: "系统管理",
    children: [
      {
        // 没标：跟着树级开关走
        value: "user",
        label: "用户管理",
        children: [
          { value: "user:add", label: "新增" },
          { value: "user:edit", label: "编辑" },
          { value: "user:del", label: "删除" },
          { value: "user:export", label: "导出" },
        ],
      },
      {
        // 标了横排：开关拨到竖排也照横
        value: "role",
        label: "角色管理",
        childrenOrientation: "horizontal" as const,
        children: [
          { value: "role:add", label: "新增" },
          { value: "role:grant", label: "授权" },
          { value: "role:del", label: "删除" },
        ],
      },
      {
        // 标了竖排：按住树级的横排
        value: "log",
        label: "日志管理",
        childrenOrientation: "vertical" as const,
        children: [
          { value: "log:view", label: "查看" },
          { value: "log:export", label: "导出" },
        ],
      },
    ],
  },
];

export default function Demo(): ReactNode {
  const [wide, setWide] = useState(true);
  const [selection, setSelection] = useState<string[]>(["user:add"]);

  return (
    <div style={{ width: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <label style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
        <input type="checkbox" checked={wide} onChange={e => setWide(e.target.checked)} />
        按钮那层横排
      </label>

      <XhTreeRoot
        selection={selection}
        onSelectionChange={details => setSelection(details.value)}
        collection={collection}
        leafOrientation={wide ? "horizontal" : "vertical"}
        defaultExpandedValue={["system", "user", "role", "log"]}
        multiple
        cascade
      >
        <XhTreeLabel>菜单授权</XhTreeLabel>
        <XhTreeTree>
          {collection.map(dir => (
            <XhTreeBranch key={dir.value} value={dir.value}>
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchCheckbox />
                <XhTreeBranchText>{dir.label}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {dir.children.map(menu => (
                  <XhTreeBranch key={menu.value} value={menu.value}>
                    <XhTreeBranchControl>
                      <XhTreeBranchTrigger />
                      <XhTreeBranchCheckbox />
                      <XhTreeBranchText>{menu.label}</XhTreeBranchText>
                    </XhTreeBranchControl>
                    <XhTreeBranchContent>
                      {menu.children.map(btn => (
                        <XhTreeItem key={btn.value} value={btn.value}>
                          <XhTreeItemCheckbox />
                          <XhTreeItemText>{btn.label}</XhTreeItemText>
                        </XhTreeItem>
                      ))}
                    </XhTreeBranchContent>
                  </XhTreeBranch>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
      </XhTreeRoot>
    </div>
  );
}
`;export{e as default};
