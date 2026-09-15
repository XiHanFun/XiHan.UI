const n=`// 取下一页的按钮 | 与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，这颗按钮是它的键盘等价入口
import type { ReactNode } from "react";
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState(() =>
    Array.from({ length: 10 }, (_, i) => \`第 \${i + 1} 条\`),
  );
  const [loading, setLoading] = useState(false);

  // 取下一页；这里用定时器代替真实请求
  function onLoad(): void {
    setLoading(true);
    window.setTimeout(() => {
      setItems(list => [
        ...list,
        ...Array.from({ length: 6 }, (_, i) => \`第 \${list.length + i + 1} 条\`),
      ]);
      setLoading(false);
    }, 500);
  }

  return (
    <div
      ref={setScrollEl}
      style={{
        blockSize: "240px",
        overflow: "auto",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      <XhInfiniteScrollRoot target={scrollEl} loading={loading} onLoad={onLoad}>
        {items.map(item => (
          <div key={item} style={{ padding: "8px 12px" }}>{item}</div>
        ))}
        <XhInfiniteScrollSentinel />
        {/* 文案写在按钮里：组件不代填名字，读屏念的与眼睛看的是同一句 */}
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 12px" }}>
          <XhInfiniteScrollLoadMoreTrigger>
            {loading ? "正在取下一页…" : "加载更多"}
          </XhInfiniteScrollLoadMoreTrigger>
        </div>
      </XhInfiniteScrollRoot>
    </div>
  );
}
`;export{n as default};
