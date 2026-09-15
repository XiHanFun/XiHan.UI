const n=`// 弹簧 | 感知参数调出物理参数，曲线是解析解直接采样的，右边的方块按同一条曲线走
import type { ReactNode } from "react";
import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [duration, setDuration] = useState(0.5);
  const [bounce, setBounce] = useState(0.3);

  const solver = useMemo(() => createSpring({ duration, bounce }), [duration, bounce]);

  // 曲线画在 0..1 的归一化坐标里，y 轴翻过来让 1 在上方
  const path = useMemo(() => {
    const seconds = solver.durationMs / 1000;
    const points: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const value = solver(t * seconds);
      points.push(\`\${(t * 280).toFixed(1)},\${(110 - value * 80).toFixed(1)}\`);
    }
    return \`M \${points.join(" L ")}\`;
  }, [solver]);

  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => () => handle.current?.cancel(), []);

  function play(): void {
    const el = box.current;
    if (!el) {
      return;
    }
    handle.current?.cancel();
    handle.current = animate(
      el,
      [{ translate: "0 0" }, { translate: "180px 0" }],
      { duration: solver.durationMs, easing: springToLinearEasing(solver, 48), fill: "forwards" },
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {\`时长 \${duration.toFixed(2)}s\`}
          <input
            type="range"
            min="0.15"
            max="1.2"
            step="0.05"
            value={duration}
            onChange={event => setDuration(Number(event.target.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {\`弹性 \${bounce.toFixed(2)}\`}
          <input
            type="range"
            min="-0.8"
            max="0.8"
            step="0.05"
            value={bounce}
            onChange={event => setBounce(Number(event.target.value))}
          />
        </label>
      </div>

      <p style={{ margin: 0, fontSize: "13px", opacity: 0.7 }}>
        {\`阻尼比 \${solver.dampingRatio.toFixed(3)} · 沉降 \${Math.round(solver.durationMs)}ms · 过冲 \${(solver.overshoot * 100).toFixed(1)}%\`}
      </p>

      <svg viewBox="0 0 280 120" style={{ width: "100%", height: "120px" }}>
        <line x1="0" y1="30" x2="280" y2="30" stroke="var(--vp-c-divider)" strokeDasharray="4 4" />
        <line x1="0" y1="110" x2="280" y2="110" stroke="var(--vp-c-divider)" />
        <path d={path} fill="none" stroke="var(--vp-c-brand-1)" strokeWidth="2" />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          style={{
            padding: "6px 14px",
            border: "1px solid var(--vp-c-divider)",
            borderRadius: "8px",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
          onClick={play}
        >
          播一次
        </button>
        <div
          style={{
            position: "relative",
            flex: 1,
            height: "40px",
            border: "1px dashed var(--vp-c-divider)",
            borderRadius: "8px",
          }}
        >
          <div
            ref={box}
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--vp-c-brand-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
`;export{n as default};
