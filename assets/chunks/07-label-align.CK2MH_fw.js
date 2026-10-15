var e=`// 标签对齐 | 标签在左时同一列的标签收到这一列最长的那个，竖线上下对齐；跨列的格与没摆满的最后一行照常画线
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const rows = [
  { label: "申请人", value: "张三" },
  { label: "状态", value: "待审批" },
  { label: "申请对象", value: "财务部 · 报销审批", span: 2 },
  { label: "申请原因", value: "季度结算期间临时代审，结算完成后收回", span: 2 },
  { label: "期望有效期", value: "2026-10-14 至 2026-11-14", span: 2 },
  { label: "申请时间", value: "2026-10-14 09:30" },
];

export default function Demo(): ReactNode {
  return (
    <XhDescriptionsRoot columns={2} variant="outline" placement="left" style={{ maxInlineSize: "640px" }}>
      {rows.map(row => (
        <XhDescriptionsItem key={row.label} span={row.span}>
          <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
          <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
        </XhDescriptionsItem>
      ))}
    </XhDescriptionsRoot>
  );
}
`;export{e as default};