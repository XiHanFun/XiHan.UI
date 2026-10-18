// 条目说明 | 一句名称说不清的解释写进说明，叶子与分支都可以带，落在名称下面一行；窄的时候截断，不把树撑宽
import type { ReactNode } from "react";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchDescription,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemDescription,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/react";

const collection = [
  {
    value: "order",
    label: "订单",
    description: "一笔订单抬头上的字段",
    children: [
      { value: "no", label: "订单号", description: "系统生成的唯一编号，打印在单据抬头与条码里" },
      { value: "date", label: "下单日期", description: "按下单时所在时区记" },
      { value: "amount", label: "实付金额" },
    ],
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "240px" }}>
      <XhTreeRoot collection={collection} defaultExpandedValue={["order"]}>
        <XhTreeLabel>字段</XhTreeLabel>
        <XhTreeTree>
          {collection.map(group => (
            <XhTreeBranch key={group.value} value={group.value}>
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchText>{group.label}</XhTreeBranchText>
                <XhTreeBranchDescription>{group.description}</XhTreeBranchDescription>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {group.children.map(field => (
                  <XhTreeItem key={field.value} value={field.value}>
                    <XhTreeItemText>{field.label}</XhTreeItemText>
                    {field.description ? <XhTreeItemDescription>{field.description}</XhTreeItemDescription> : null}
                    <XhTreeItemIndicator />
                  </XhTreeItem>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
      </XhTreeRoot>
    </div>
  );
}
