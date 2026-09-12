const n=`// 语气 | tone 换的是选中那一节的指示条与文字颜色，这里用 default-value 预置「用法」为选中项
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const sections = [
  { value: "anchor-tone-install", label: "安装" },
  { value: "anchor-tone-usage", label: "用法" },
  { value: "anchor-tone-faq", label: "常见问题" },
];

const grid: CSSProperties = {
  inlineSize: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "20px",
};

export default function Demo(): ReactNode {
  return (
    <div style={grid}>
      {tones.map(t => (
        <div key={t}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{t}</div>
          <XhAnchorRoot tone={t} defaultValue="anchor-tone-usage">
            <XhAnchorList>
              {sections.map(s => (
                <XhAnchorItem key={s.value}>
                  <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
                </XhAnchorItem>
              ))}
              {/* 指示条必须住在 list 里：它以 list 为定位参照系 */}
              <XhAnchorIndicator />
            </XhAnchorList>
          </XhAnchorRoot>
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
