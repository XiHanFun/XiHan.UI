const n=`// 列数 | columns 决定每行摆几组，一到六列；排版走 CSS Grid，不用表格
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const rows = [
  { label: "姓名", value: "张三" },
  { label: "工号", value: "A-1024" },
  { label: "部门", value: "技术部" },
  { label: "岗位", value: "前端工程师" },
  { label: "入职", value: "2024-03-01" },
  { label: "座机", value: "8021" },
];

export default function Demo(): ReactNode {
  return (
    <XhDescriptionsRoot columns={3}>
      {rows.map(row => (
        <XhDescriptionsItem key={row.label}>
          <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
          <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
        </XhDescriptionsItem>
      ))}
    </XhDescriptionsRoot>
  );
}
`;export{n as default};
