const n=`// 从外部跳到某一节 | 组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhButton,
} from "@xihan-ui/react";
import { useState } from "react";

// 判定线与滚动落点用同一个偏移，跳过去之后高亮正好落在这一节
const OFFSET = 12;

const sections = [
  { value: "anchor-goto-intro", label: "简介" },
  { value: "anchor-goto-usage", label: "用法" },
  { value: "anchor-goto-faq", label: "常见问题" },
];

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: "20px",
  alignItems: "start",
};

const scroller: CSSProperties = {
  blockSize: "220px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  const [active, setActive] = useState<string | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  function jumpTo(id: string): void {
    const container = scrollEl;
    const target = container?.querySelector<HTMLElement>(\`#\${id}\`);
    if (!container || !target) {
      return;
    }
    const delta
      = target.getBoundingClientRect().top
        - container.getBoundingClientRect().top
        - OFFSET;
    container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {sections.map(s => (
          <XhButton key={s.value} size="sm" variant="outline" onClick={() => jumpTo(s.value)}>
            {\`跳到\${s.label}\`}
          </XhButton>
        ))}
        <span>{\`当前：\${active ?? "（还没有一节越过判定线）"}\`}</span>
      </div>

      <div style={layout}>
        <XhAnchorRoot
          value={active}
          scrollElement={scrollEl}
          offset={OFFSET}
          smooth
          onValueChange={details => setActive(details.value)}
        >
          <XhAnchorList>
            {sections.map(s => (
              <XhAnchorItem key={s.value}>
                <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
              </XhAnchorItem>
            ))}
            <XhAnchorIndicator />
          </XhAnchorList>
        </XhAnchorRoot>

        <div ref={setScrollEl} style={scroller}>
          {sections.map(s => (
            <div key={s.value} id={s.value} style={{ blockSize: "180px" }}>
              <strong>{s.label}</strong>
              <p>这一节的正文。</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;export{n as default};
