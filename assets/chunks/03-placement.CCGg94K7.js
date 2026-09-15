const e=`// 内容在哪一侧 | placement 决定内容落在线的哪一侧；alternate 是逐条交替，线走中间
import type { ReactNode } from "react";
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTitle,
} from "@xihan-ui/react";

// 中间一档不写 placement，用 undefined 表达
const placements = [
  { placement: undefined, label: "默认（内容在结束侧）" },
  { placement: "start", label: "start（内容在起始侧）" },
  { placement: "alternate", label: "alternate（逐条交替）" },
] as const;

const events = [
  { title: "立项", description: "需求评审通过" },
  { title: "开发", description: "三个迭代" },
  { title: "上线", description: "灰度两周" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {placements.map(p => (
        <div key={p.label}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{p.label}</div>
          <XhTimelineRoot placement={p.placement} style={{ inlineSize: "100%" }}>
            {events.map(e => (
              <XhTimelineItem key={e.title}>
                <XhTimelineIndicator />
                <XhTimelineConnector />
                <XhTimelineContent>
                  <XhTimelineTitle>{e.title}</XhTimelineTitle>
                  <XhTimelineDescription>{e.description}</XhTimelineDescription>
                </XhTimelineContent>
              </XhTimelineItem>
            ))}
          </XhTimelineRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
