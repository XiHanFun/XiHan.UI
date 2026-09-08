// 基础用法 | 目录跟着滚动位置自己换高亮；scroll-element 把判定线挂到指定滚动容器上，不给就挂在窗口上
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useState } from "react";

// 链接的 value 就是目标区块的 id：href 由组件按它派生
const sections = [
  { value: "anchor-basic-intro", label: "这是什么" },
  { value: "anchor-basic-keyboard", label: "键盘怎么走" },
  { value: "anchor-basic-edge", label: "边界在哪" },
  { value: "anchor-basic-token", label: "主题与令牌" },
];

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: "20px",
  inlineSize: "100%",
  alignItems: "start",
};

const scroller: CSSProperties = {
  blockSize: "240px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div style={layout}>
      <XhAnchorRoot scrollElement={scrollEl} smooth>
        <XhAnchorList>
          {sections.map(s => (
            <XhAnchorItem key={s.value}>
              <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
            </XhAnchorItem>
          ))}
          {/* 指示条必须住在 list 里：它以 list 为定位参照系，而 ul 里只放得下 li */}
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div ref={setScrollEl} style={scroller}>
        {/* 目标区块是页面内容、不是组件的部件：组件按链接的 value 现查 id */}
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "180px" }}>
            <strong>{s.label}</strong>
            <p>滚动这一栏，看左边哪一条亮起来。</p>
          </div>
        ))}
      </div>
    </div>
  );
}
