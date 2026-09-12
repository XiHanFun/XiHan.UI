const n=`// 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开就是一组元素
import type { StaggerFrom } from "@xihan-ui/animations";
import type { ReactNode } from "react";
import { createMotionPlayer, splitText } from "@xihan-ui/animations";
import { XhButton, XhRadioGroupRoot } from "@xihan-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

const fromOptions = [
  { value: "first", label: "从头" },
  { value: "last", label: "从尾" },
  { value: "center", label: "从中间" },
];

const blocks = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Demo(): ReactNode {
  const motion = useMemo(() => createMotionPlayer(), []);
  const list = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [from, setFrom] = useState<StaggerFrom>("first");
  const [gap, setGap] = useState(60);

  useEffect(() => () => motion.cancel(), [motion]);

  function playList(): void {
    const el = list.current;
    if (!el)
      return;
    void motion.playAll([...el.children] as HTMLElement[], "rise", {
      stagger: gap,
      from,
    });
  }

  async function playTitle(): Promise<void> {
    const el = title.current;
    if (!el)
      return;
    const { parts, restore } = splitText(el);
    await motion.playAll(parts, "fade-up", { stagger: 30 });
    restore();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
        <XhRadioGroupRoot
          value={from}
          onValueChange={details => setFrom((details.value ?? "first") as StaggerFrom)}
          collection={fromOptions}
          label="起点"
          name="stagger-from"
        />
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {\`间隔 \${gap}ms\`}
          <input
            value={gap}
            type="range"
            min="0"
            max="200"
            step="10"
            onChange={event => setGap(Number(event.target.value))}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" onClick={playList}>播列表</XhButton>
        <XhButton size="sm" variant="outline" onClick={() => void playTitle()}>播标题</XhButton>
      </div>

      <h3 ref={title} style={{ margin: 0, fontSize: "24px" }}>曦寒 UI 动画层</h3>

      <div ref={list} style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {blocks.map(n => (
          <div
            key={n}
            style={{
              display: "grid",
              placeItems: "center",
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "var(--vp-c-brand-soft)",
              fontWeight: 600,
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
`;export{n as default};
