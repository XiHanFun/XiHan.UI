const n=`// 提前量 | distance 把可视区沿块轴向外扩，哨兵还没露头就先取下一页
import type { ReactNode } from "react";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [distance, setDistance] = useState(200);
  const [items, setItems] = useState(() =>
    Array.from({ length: 12 }, (_, i) => \`第 \${i + 1} 条\`),
  );
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState(0);

  function onLoad(): void {
    setLoading(true);
    window.setTimeout(() => {
      setItems(list => [
        ...list,
        ...Array.from({ length: 8 }, (_, i) => \`第 \${list.length + i + 1} 条\`),
      ]);
      setRounds(n => n + 1);
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        提前
        <input
          type="range"
          min={0}
          max={400}
          step={50}
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
        />
        {\`\${distance}px 触发 · 已取 \${rounds} 页\`}
      </label>

      <div
        ref={setScrollEl}
        style={{
          blockSize: "220px",
          overflow: "auto",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        {/* 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来 */}
        <XhInfiniteScrollRoot
          target={scrollEl}
          distance={distance}
          loading={loading}
          onLoad={onLoad}
        >
          {items.map(item => (
            <div key={item} style={{ padding: "8px 12px" }}>{item}</div>
          ))}
          <XhInfiniteScrollSentinel />
        </XhInfiniteScrollRoot>
      </div>
    </div>
  );
}
`;export{n as default};
