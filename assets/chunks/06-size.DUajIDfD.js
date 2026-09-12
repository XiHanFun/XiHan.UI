const n=`// 尺寸 | size 换条目的字号与左右内边距，不传 size 即默认档
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const sections = [
  { value: "anchor-size-install", label: "安装" },
  { value: "anchor-size-usage", label: "用法" },
  { value: "anchor-size-faq", label: "常见问题" },
];

const grid: CSSProperties = {
  inlineSize: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "20px",
  alignItems: "start",
};

export default function Demo(): ReactNode {
  return (
    <div style={grid}>
      {sizes.map(s => (
        <div key={s.label}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{s.label}</div>
          <XhAnchorRoot size={s.size} defaultValue="anchor-size-usage">
            <XhAnchorList>
              {sections.map(sec => (
                <XhAnchorItem key={sec.value}>
                  <XhAnchorLink value={sec.value}>{sec.label}</XhAnchorLink>
                </XhAnchorItem>
              ))}
              <XhAnchorIndicator />
            </XhAnchorList>
          </XhAnchorRoot>
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
