var e=`// 提前量 | distance 把可视区沿块轴向外扩展，哨兵尚未出现就先取下一页
import type { ReactNode } from "react";
import {
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  // 滑块的值恒为数组，单滑块取第一项
  const [distance, setDistance] = useState([200]);
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
    <>
      <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
        <XhSliderRoot
          value={distance}
          onValueChange={details => setDistance(details.value)}
          min={0}
          max={400}
          step={50}
        >
          <XhSliderLabel>提前量</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb />
          </XhSliderControl>
        </XhSliderRoot>

        <div
          ref={setScrollEl}
          data-xh-scroll=""
          style={{
            blockSize: "220px",
            overflow: "auto",
            border: "var(--xh-stroke-thin) solid var(--xh-border-default)",
            borderRadius: "var(--xh-shape-surface)",
          }}
        >
          {/* 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来 */}
          <XhInfiniteScrollRoot
            target={scrollEl}
            distance={distance[0]}
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

      <span data-demo-output>{\`\${distance[0]}px 触发 · 已取 \${rounds} 页\`}</span>
    </>
  );
}
`;export{e as default};