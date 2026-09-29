const e=`// 有向与节点大小 | directed 在连线的目标一端画箭头，提示框分出入；节点的 value 决定面积，连线的 value 决定粗细
import type { ReactNode } from "react";
import { XhGraphChartRoot } from "@xihan-ui/react";

// value 是每个服务的请求量：面积与它成正比
const services = [
  { id: "gateway", name: "网关", group: "接入", value: 1200 },
  { id: "user", name: "用户", group: "业务", value: 420 },
  { id: "order", name: "订单", group: "业务", value: 680 },
  { id: "pay", name: "支付", group: "业务", value: 260 },
  { id: "notify", name: "通知", group: "业务", value: 150 },
  { id: "cache", name: "缓存", group: "数据", value: 900 },
  { id: "mq", name: "消息队列", group: "数据", value: 310 },
];

// value 是这条调用的请求量：线的粗细与它成正比
const calls = [
  { source: "gateway", target: "user", value: 420 },
  { source: "gateway", target: "order", value: 680 },
  { source: "order", target: "pay", value: 260 },
  { source: "order", target: "notify", value: 120 },
  { source: "pay", target: "notify", value: 30 },
  { source: "user", target: "cache", value: 380 },
  { source: "order", target: "cache", value: 520 },
  { source: "notify", target: "mq", value: 150 },
  { source: "pay", target: "mq", value: 160 },
];

export default function Demo(): ReactNode {
  return (
    <XhGraphChartRoot
      nodes={services}
      links={calls}
      directed={true}
      caption="服务调用量（次 / 秒）"
    />
  );
}
`;export{e as default};
