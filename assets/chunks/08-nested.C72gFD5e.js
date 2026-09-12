const n=`// 二级目录 | 子链接嵌在父项里的原生列表中，按文档序照常参与结算；父级要不要跟着亮由宿主自己算
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useState } from "react";

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

// 正文区块按文档序摊平，父节与子节共用一份清单
const sections = groups.flatMap(g => [{ value: g.value, label: g.label }, ...g.children]);

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "160px 1fr",
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

const subList: CSSProperties = {
  margin: 0,
  padding: 0,
  paddingInlineStart: "12px",
  listStyle: "none",
};

export default function Demo(): ReactNode {
  const [active, setActive] = useState<string | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  // 子节命中时父节一起点亮
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
        scrollElement={scrollEl}
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
              {/* 子级用一层原生 ul 承载：再嵌一个 XhAnchorList 会把指示条的参照系抢走 */}
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

      <div ref={setScrollEl} style={scroller}>
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "140px" }}>
            <strong>{s.label}</strong>
            <p>这一节的正文。</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`;export{n as default};
