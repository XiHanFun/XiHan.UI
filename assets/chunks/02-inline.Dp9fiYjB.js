const n=`// 无壳内联形态 | ghost 档不占一块面，开关收成只占文字宽度的小药丸，适合在一段回答里穿插好几处
import type { ReactNode } from "react";
import {
  XhReasoningContent,
  XhReasoningDuration,
  XhReasoningIcon,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/react";

const notes = [
  {
    id: "a",
    start: 0,
    end: 2400,
    text: "先确认这次只改皮肤：解剖与事件都不动，公开面就只增不减。",
  },
  {
    id: "b",
    start: 0,
    end: 700,
    text: "再看形态轴：ghost 关掉底与描边，缩进由左侧那条竖线接管。",
  },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-2)" }}>
      <p>把两处思考穿插在同一段回答里，它们不再各自占一张卡：</p>
      {notes.map(note => (
        <XhReasoningRoot
          key={note.id}
          variant="ghost"
          startTime={note.start}
          endTime={note.end}
        >
          {({ durationMs }) => (
            <>
              <XhReasoningTrigger>
                <XhReasoningIcon />
                <XhReasoningIndicator />
                <XhReasoningLabel>思考过程</XhReasoningLabel>
                <XhReasoningDuration>
                  {\`\${((durationMs ?? 0) / 1000).toFixed(1)} 秒\`}
                </XhReasoningDuration>
              </XhReasoningTrigger>
              <XhReasoningContent>{note.text}</XhReasoningContent>
            </>
          )}
        </XhReasoningRoot>
      ))}
    </div>
  );
}
`;export{n as default};
