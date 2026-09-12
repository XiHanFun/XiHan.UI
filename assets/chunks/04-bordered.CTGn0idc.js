const e=`// 外框 | bordered 画一圈描边，并在格与格之间补上网格线
import type { ReactNode } from "react";
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const rows = [
  { label: "商品", value: "机械键盘" },
  { label: "单价", value: "￥499.00" },
  { label: "数量", value: "2" },
  { label: "小计", value: "￥998.00" },
];

export default function Demo(): ReactNode {
  return (
    <XhDescriptionsRoot bordered columns={2} placement="left">
      {rows.map(row => (
        <XhDescriptionsItem key={row.label}>
          <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
          <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
        </XhDescriptionsItem>
      ))}
    </XhDescriptionsRoot>
  );
}
`;export{e as default};
