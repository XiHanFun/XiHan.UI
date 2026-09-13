const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 嵌套目录 | 展示父级与子级章节
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

const groups = [
  {
    value: "anchor-nested-guide",
    label: "指南",
    children: [
      { value: "anchor-nested-install", label: "安装" },
      { value: "anchor-nested-start", label: "快速开始" },
    ],
  },
  {
    value: "anchor-nested-api",
    label: "接口",
    children: [
      { value: "anchor-nested-props", label: "属性" },
      { value: "anchor-nested-events", label: "事件" },
    ],
  },
];

const sections = groups.flatMap(g => [{ value: g.value, label: g.label }, ...g.children]);

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(128px, 160px) minmax(0, 1fr)",
  gap: "20px",
  inlineSize: "min(640px, 100%)",
  alignItems: "start",
};

const scroller: CSSProperties = {
  blockSize: "240px",
  overflow: "auto",
  paddingInline: "12px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

const subList: CSSProperties = {
  margin: 0,
  padding: 0,
  paddingInlineStart: "12px",
  listStyle: "none",
};

export default function Demo(): ReactNode {
  const [active, setActive] = useState<string | null>(null);
  const scrollEl = useRef<HTMLDivElement>(null);

  function isGroupActive(group: {
    value: string;
    children: readonly { value: string }[];
  }): boolean {
    return active === group.value || group.children.some(c => c.value === active);
  }

  return (
    <div style={layout}>
      <XhAnchorRoot
        value={active}
        scrollElement={() => scrollEl.current}
        smooth
        onValueChange={details => setActive(details.value)}
      >
        <XhAnchorList>
          {groups.map(g => (
            <XhAnchorItem key={g.value} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <XhAnchorLink
                value={g.value}
                style={isGroupActive(g) ? { color: "var(--xh-fg-brand)" } : undefined}
              >
                {g.label}
              </XhAnchorLink>
              <ul style={subList}>
                {g.children.map(c => (
                  <XhAnchorItem key={c.value}>
                    <XhAnchorLink value={c.value}>{c.label}</XhAnchorLink>
                  </XhAnchorItem>
                ))}
              </ul>
            </XhAnchorItem>
          ))}
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div ref={scrollEl} style={scroller}>
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "140px", paddingBlock: "12px" }}>
            <strong>{s.label}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{\`\${s.label}相关内容\`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`;export{n as default};
