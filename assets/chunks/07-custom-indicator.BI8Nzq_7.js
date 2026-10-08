var e=`// 自定义圆点 | 圆点是个容器，里面可以放图标；放图标时在根上把 --xh-timeline-indicator-size 调大一档，整列一样大，连线才对得齐
import type { CSSProperties, ReactNode } from "react";
import { PackageIcon, ReceiptIcon, TruckIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
} from "@xihan-ui/react";

const events = [
  { tone: "success", icon: ReceiptIcon, time: "09-26 10:02", title: "已下单", description: "订单号 A-20931" },
  { tone: "success", icon: PackageIcon, time: "09-26 16:40", title: "已出库", description: "上海仓 · 2 件" },
  { tone: "info", icon: TruckIcon, time: "09-27 08:15", title: "运输中", description: "预计明天送达" },
] as const;

// 自定义属性不在 CSSProperties 的键里，整份样式按它断言
const rootStyle = {
  "maxInlineSize": "360px",
  "--xh-timeline-indicator-size": "var(--xh-space-6)",
  "--xh-icon-size": "var(--xh-glyph-size-sm)",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhTimelineRoot style={rootStyle}>
      {events.map(e => (
        <XhTimelineItem key={e.title} tone={e.tone}>
          <XhTimelineIndicator><XhIcon icon={e.icon} /></XhTimelineIndicator>
          <XhTimelineConnector />
          <XhTimelineContent>
            <XhTimelineTime>{e.time}</XhTimelineTime>
            <XhTimelineTitle>{e.title}</XhTimelineTitle>
            <XhTimelineDescription>{e.description}</XhTimelineDescription>
          </XhTimelineContent>
        </XhTimelineItem>
      ))}
    </XhTimelineRoot>
  );
}
`;export{e as default};