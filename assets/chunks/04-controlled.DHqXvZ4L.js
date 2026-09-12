const n=`// 受控开合与禁用 | open 交给宿主：外面一颗钮统一开合几段思考，自动开合让位；disabled 的那一段开关按不动，停在给定的那一档
import type { ReactNode } from "react";
import {
  XhButton,
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const notes = [
  {
    id: "plan",
    start: 0,
    end: 2400,
    text: "先确认这次只改皮肤：解剖与事件都不动，公开面就只增不减。",
  },
  {
    id: "check",
    start: 0,
    end: 900,
    text: "再看形态轴：outline 只留一条描边，底色交回页面。",
  },
];

const translations = {
  label: "思考过程",
  thinking: "正在思考…",
  thoughtFor: "想了 {seconds} 秒",
};

export default function Demo(): ReactNode {
  // 每段各占一位，外面那两颗钮改的是同一份状态
  const [open, setOpen] = useState([true, false]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" variant="outline" onClick={() => setOpen(open.map(() => true))}>
          全部展开
        </XhButton>
        <XhButton size="sm" variant="outline" onClick={() => setOpen(open.map(() => false))}>
          全部收起
        </XhButton>
      </div>

      {notes.map((note, index) => (
        <XhReasoningRoot
          key={note.id}
          open={open[index]}
          onOpenChange={details => setOpen(open.map((v, i) => (i === index ? details.open : v)))}
          variant="outline"
          startTime={note.start}
          endTime={note.end}
          translations={translations}
        >
          <XhReasoningTrigger>
            <XhReasoningIndicator />
            <XhReasoningLabel />
          </XhReasoningTrigger>
          <XhReasoningContent>{note.text}</XhReasoningContent>
        </XhReasoningRoot>
      ))}

      {/* 归档的那一段：开关按不动，正文停在收起 */}
      <XhReasoningRoot
        variant="outline"
        disabled
        open={false}
        startTime={0}
        endTime={12000}
        translations={translations}
      >
        <XhReasoningTrigger>
          <XhReasoningIndicator />
          <XhReasoningLabel />
        </XhReasoningTrigger>
        <XhReasoningContent>这一段已归档，正文不再展开。</XhReasoningContent>
      </XhReasoningRoot>
    </div>
  );
}
`;export{n as default};
