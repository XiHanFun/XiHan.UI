const e=`// 级联勾选与回显策略 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛，parent 档整组选满只报组名
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
import { useState } from "react";

const collection = [
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user:view", label: "查看" },
      { value: "user:edit", label: "编辑" },
      { value: "user:del", label: "删除" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order:view", label: "查看" },
      { value: "order:export", label: "导出" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["user:view"]);

  return (
    <>
      <XhTreeSelectRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        collection={collection}
        defaultExpandedValue={["user", "order"]}
        multiple
        cascade
        checkedStrategy="parent"
        style={{ maxInlineSize: "340px" }}
      >
        {() => (
          <>
            <XhTreeSelectLabel>权限</XhTreeSelectLabel>
            <XhTreeSelectControl>
              <XhTreeSelectTrigger>
                {/* parent 收敛下整组选满值就是组名，缺省显示文本直接可用 */}
                <XhTreeSelectValueText />
                <XhTreeSelectIndicator />
              </XhTreeSelectTrigger>
            </XhTreeSelectControl>
            <XhTreeSelectPositioner>
              <XhTreeSelectContent>
                <XhTreeSelectTree>
                  {collection.map(group => (
                    <XhTreeSelectBranch key={group.value} value={group.value}>
                      <XhTreeSelectBranchControl>
                        <XhTreeSelectBranchTrigger />
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectBranchText>{group.label}</XhTreeSelectBranchText>
                      </XhTreeSelectBranchControl>
                      <XhTreeSelectBranchContent>
                        {group.children.map(item => (
                          <XhTreeSelectItem key={item.value} value={item.value}>
                            <XhTreeSelectItemIndicator />
                            <XhTreeSelectItemText>{item.label}</XhTreeSelectItemText>
                          </XhTreeSelectItem>
                        ))}
                      </XhTreeSelectBranchContent>
                    </XhTreeSelectBranch>
                  ))}
                </XhTreeSelectTree>
              </XhTreeSelectContent>
            </XhTreeSelectPositioner>
          </>
        )}
      </XhTreeSelectRoot>
      <p>{\`对外值（parent 收敛）：\${value.length ? value.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
