// 受控 | 传了 value 就由宿主说了算；一节都没越过判定线时它是 null，此时谁都不亮、指示条整条收起
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

const sections = [
  { value: "anchor-ctl-install", label: "安装" },
  { value: "anchor-ctl-usage", label: "用法" },
  { value: "anchor-ctl-faq", label: "常见问题" },
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <div style={layout}>
        <XhAnchorRoot
          value={active}
          scrollElement={scrollEl}
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

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton variant="outline" onClick={() => setActive("anchor-ctl-faq")}>
          点亮「常见问题」
        </XhButton>
        <span>{`当前：${active ?? "（还没有一节越过判定线）"}`}</span>
      </div>
    </div>
  );
}
