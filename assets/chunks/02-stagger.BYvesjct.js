var e=`// 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开即为一组元素
import type { StaggerFrom } from "@xihan-ui/animations";
import type { ReactNode } from "react";
import { createMotionPlayer, splitText } from "@xihan-ui/animations";
import {
  XhButton,
  XhRadioGroupRoot,
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";
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
  // 滑块的值恒为数组，单滑块即长度 1
  const [gap, setGap] = useState([60]);

  useEffect(() => () => motion.cancel(), [motion]);

  function playList(): void {
    const el = list.current;
    if (!el)
      return;
    void motion.playAll([...el.children] as HTMLElement[], "rise", {
      stagger: gap[0],
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "var(--xh-space-5)" }}>
        <XhRadioGroupRoot
          value={from}
          onValueChange={details => setFrom((details.value ?? "first") as StaggerFrom)}
          collection={fromOptions}
          label="起点"
          name="stagger-from"
        />
        <XhSliderRoot
          value={gap}
          onValueChange={details => setGap(details.value)}
          min={0}
          max={200}
          step={10}
          style={{ inlineSize: "var(--xh-control-w)" }}
        >
          <XhSliderLabel>{\`间隔 \${gap[0]}ms\`}</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>
      </div>

      <div style={{ display: "flex", gap: "var(--xh-space-2)" }}>
        <XhButton size="sm" onClick={playList}>播列表</XhButton>
        <XhButton size="sm" variant="outline" onClick={() => void playTitle()}>播标题</XhButton>
      </div>

      <h3 ref={title} style={{ margin: 0, fontSize: "var(--xh-font-size-2xl)" }}>曦寒 UI 动画层</h3>

      <div ref={list} style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-2)" }}>
        {blocks.map(n => (
          <div
            key={n}
            style={{
              display: "grid",
              placeItems: "center",
              width: "calc(2 * var(--xh-space-6))",
              height: "calc(2 * var(--xh-space-6))",
              borderRadius: "var(--xh-shape-surface)",
              background: "var(--xh-bg-subtle)",
              fontWeight: "var(--xh-font-weight-semibold)",
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
`;export{e as default};