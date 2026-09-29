const e=`// 基础用法 | 缺省是力导布局：连着的节点靠近、互不相连的推开，分组着色；悬停节点时它的邻居与连线留着，拖动节点看邻居跟着动
import type { ReactNode } from "react";
import { XhGraphChartRoot } from "@xihan-ui/react";

// 节点：身份、名字与分组
const services = [
  { id: "gateway", name: "网关", group: "接入" },
  { id: "auth", name: "认证", group: "接入" },
  { id: "user", name: "用户", group: "业务" },
  { id: "order", name: "订单", group: "业务" },
  { id: "pay", name: "支付", group: "业务" },
  { id: "stock", name: "库存", group: "业务" },
  { id: "notify", name: "通知", group: "业务" },
  { id: "user-db", name: "用户库", group: "数据" },
  { id: "order-db", name: "订单库", group: "数据" },
  { id: "cache", name: "缓存", group: "数据" },
  { id: "mq", name: "消息队列", group: "数据" },
];

// 连线：两端节点的身份
const calls = [
  { source: "gateway", target: "auth" },
  { source: "gateway", target: "user" },
  { source: "gateway", target: "order" },
  { source: "order", target: "pay" },
  { source: "order", target: "stock" },
  { source: "order", target: "notify" },
  { source: "pay", target: "notify" },
  { source: "user", target: "user-db" },
  { source: "order", target: "order-db" },
  { source: "user", target: "cache" },
  { source: "order", target: "cache" },
  { source: "notify", target: "mq" },
  { source: "pay", target: "mq" },
];

export default function Demo(): ReactNode {
  return (
    <XhGraphChartRoot
      nodes={services}
      links={calls}
      caption="服务调用关系"
    />
  );
}
`;export{e as default};
