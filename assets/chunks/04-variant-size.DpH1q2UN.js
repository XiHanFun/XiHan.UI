const e=`// 形态与尺寸 | variant 换这块闸门怎么与正文分开，size 换标题、条目与按钮的几何档；判定链一个字不动
import type { ApprovalScope } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalRoot,
  XhApprovalTitle,
} from "@xihan-ui/react";

const scopes: ApprovalScope[] = [{ value: "write", label: "写回改动" }];

const rows = [
  { variant: "outline", size: "md", label: "描边（缺省）" },
  { variant: "subtle", size: "md", label: "弱底分区" },
  { variant: "ghost", size: "md", label: "无壳内联" },
  { variant: "outline", size: "sm", label: "小档" },
  { variant: "outline", size: "lg", label: "大档" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rows.map(row => (
        <XhApprovalRoot key={row.label} scopes={scopes} variant={row.variant} size={row.size}>
          <XhApprovalTitle>{row.label}</XhApprovalTitle>
          <XhApprovalGroup>
            <XhApprovalItem scopeValue="write" scopeLabel="写回改动">
              <XhApprovalItemIndicator scopeValue="write" />
              <XhApprovalItemText scopeValue="write">写回改动</XhApprovalItemText>
            </XhApprovalItem>
          </XhApprovalGroup>
          <XhApprovalFooter>
            <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
            <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
          </XhApprovalFooter>
        </XhApprovalRoot>
      ))}
    </div>
  );
}
`;export{e as default};
