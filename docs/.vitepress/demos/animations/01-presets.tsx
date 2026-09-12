// 预设一览 | 十七个内置预设，进场一族从不在场进来，注意一族原地提醒；播完都回到静息态
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "140px",
          border: "1px dashed var(--vp-c-divider)",
          borderRadius: "12px",
        }}
      >
        <div
          ref={card}
          style={{
            padding: "16px 24px",
            borderRadius: "10px",
            background: "var(--vp-c-brand-1)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {last || "点下面的名字"}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 8px", fontSize: "13px", opacity: 0.7 }}>进场</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
        <p style={{ margin: "0 0 8px", fontSize: "13px", opacity: 0.7 }}>注意</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
