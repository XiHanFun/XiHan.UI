const n=`// 标题与附加内容 | 列表之前的头部放标题与作用于整份描述的操作；它排在 dl 之外，标题标签按页面层级由作者选
import type { ReactNode } from "react";
import {
  XhButton,
  XhDescriptionsExtra,
  XhDescriptionsHeader,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsTitle,
  XhDescriptionsValue,
} from "@xihan-ui/react";

const order = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
  { label: "支付方式", value: "余额支付" },
  { label: "收货人", value: "林一" },
];

export default function Demo(): ReactNode {
  return (
    <XhDescriptionsRoot
      columns={2}
      variant="outline"
      style={{ maxInlineSize: "560px" }}
      header={(
        <XhDescriptionsHeader>
          <XhDescriptionsTitle as="h3">订单信息</XhDescriptionsTitle>
          <XhDescriptionsExtra>
            <XhButton variant="outline" size="sm">编辑</XhButton>
          </XhDescriptionsExtra>
        </XhDescriptionsHeader>
      )}
    >
      {order.map(row => (
        <XhDescriptionsItem key={row.label}>
          <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
          <XhDescriptionsValue>{row.value}</XhDescriptionsValue>
        </XhDescriptionsItem>
      ))}
    </XhDescriptionsRoot>
  );
}
`;export{n as default};
