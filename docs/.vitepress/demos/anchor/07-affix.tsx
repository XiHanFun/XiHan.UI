// 吸顶目录 | 目录用 sticky 钉在滚动容器顶边，滚动时留在原处；判定线仍由 offset 定
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const sections = [
  { value: "anchor-affix-intro", label: "简介" },
  { value: "anchor-affix-install", label: "安装" },
  { value: "anchor-affix-usage", label: "用法" },
  { value: "anchor-affix-faq", label: "常见问题" },
];

const scroller: CSSProperties = {
  blockSize: "260px",
  overflow: "auto",
  inlineSize: "100%",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

const sticky: CSSProperties = {
  position: "sticky",
  insetBlockStart: 0,
  background: "var(--xh-bg-surface)",
};

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div ref={setScrollEl} style={scroller}>
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "20px", padding: "12px" }}>
        {/* 外层这格随内容拉满，目录在它内部 sticky，才有可移动的余量 */}
        <div>
          <XhAnchorRoot scrollElement={scrollEl} offset={12} smooth style={sticky}>
            <XhAnchorList>
              {sections.map(s => (
                <XhAnchorItem key={s.value}>
                  <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
                </XhAnchorItem>
              ))}
              <XhAnchorIndicator />
            </XhAnchorList>
          </XhAnchorRoot>
        </div>

        <div>
          {sections.map(s => (
            <div key={s.value} id={s.value} style={{ blockSize: "200px" }}>
              <strong>{s.label}</strong>
              <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
