const e=`// 尺寸 | size 换的是圆点直径、条目间距与字号，不传 size 即默认档
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

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const events = [
  { title: "提交", description: "12 个文件" },
  { title: "合并", description: "两条评审意见" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "24px" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ inlineSize: "200px" }}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{s.label}</div>
          <XhTimelineRoot size={s.size}>
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
