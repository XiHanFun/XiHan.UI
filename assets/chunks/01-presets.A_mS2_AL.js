var e=`// 预设一览 | 十七个内置预设，进场一族从不在场进入，注意一族原地提醒；播完都回到静息态
import type { ReactNode } from "react";
import { BUILTIN_MOTION_NAMES, createMotionPlayer } from "@xihan-ui/animations";
import { XhButton } from "@xihan-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

const enter = BUILTIN_MOTION_NAMES.slice(0, 11);
const attention = BUILTIN_MOTION_NAMES.slice(11);

export default function Demo(): ReactNode {
  const motion = useMemo(() => createMotionPlayer(), []);
  const card = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState("");

  useEffect(() => () => motion.cancel(), [motion]);

  function play(name: string): void {
    const el = card.current;
    if (!el)
      return;
    setLast(name);
    void motion.play(el, name);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)", width: "100%" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "140px",
          border: "var(--xh-stroke-thin) dashed var(--xh-border-default)",
          borderRadius: "var(--xh-shape-surface)",
        }}
      >
        <div
          ref={card}
          style={{
            padding: "var(--xh-space-4) var(--xh-space-6)",
            borderRadius: "var(--xh-shape-surface)",
            background: "var(--xh-bg-brand)",
            color: "var(--xh-fg-on-brand)",
            fontWeight: "var(--xh-font-weight-semibold)",
          }}
        >
          {last || "点下面的名字"}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 var(--xh-space-2)", fontSize: "var(--xh-text-caption-size)", color: "var(--xh-fg-muted)" }}>进场</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-2)" }}>
          {enter.map(name => (
            <XhButton
              key={name}
              variant="outline"
              size="sm"
              onClick={() => play(name)}
            >
              {name}
            </XhButton>
          ))}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 var(--xh-space-2)", fontSize: "var(--xh-text-caption-size)", color: "var(--xh-fg-muted)" }}>注意</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-2)" }}>
          {attention.map(name => (
            <XhButton
              key={name}
              variant="outline"
              size="sm"
              onClick={() => play(name)}
            >
              {name}
            </XhButton>
          ))}
        </div>
      </div>
    </div>
  );
}
`;export{e as default};