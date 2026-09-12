const e=`// 坐标列 | label 与内容对置：逐条交替排布时时间戳仍停在同一侧，不跟着内容左右横跳
import type { ReactNode } from "react";
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineLabel,
  XhTimelineRoot,
  XhTimelineTitle,
} from "@xihan-ui/react";

const releases = [
  { at: "2026-05-12", title: "1.0.0", description: "首个正式版" },
  { at: "2026-06-30", title: "1.1.0", description: "拖拽排序与滚动条" },
  { at: "2026-08-10", title: "1.2.0", description: "AI 组件族" },
];

export default function Demo(): ReactNode {
  return (
    <XhTimelineRoot placement="alternate" style={{ maxInlineSize: "520px" }}>
      {releases.map(r => (
        <XhTimelineItem key={r.title}>
          <XhTimelineLabel>{r.at}</XhTimelineLabel>
          <XhTimelineIndicator />
          <XhTimelineConnector />
          <XhTimelineContent>
            <XhTimelineTitle>{r.title}</XhTimelineTitle>
            <XhTimelineDescription>{r.description}</XhTimelineDescription>
          </XhTimelineContent>
        </XhTimelineItem>
      ))}
    </XhTimelineRoot>
  );
}
`;export{e as default};
