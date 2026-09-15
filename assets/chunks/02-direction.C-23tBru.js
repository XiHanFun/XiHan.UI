const e=`// 方向 | 四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高
import type { CSSProperties, ReactNode } from "react";
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/react";

const directions = ["left", "right", "up", "down"] as const;

// 竖着滚的窗口靠自定义属性定高，自定义属性写在样式对象里
const box = {
  "--xh-marquee-block-size": "5rem",
  "border": "1px solid var(--xh-border-default)",
  "borderRadius": "6px",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {directions.map(d => (
        <div key={d} style={{ inlineSize: "200px" }}>
          <p style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{d}</p>
          <XhMarqueeRoot direction={d} style={box}>
            <XhMarqueeContent>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <span key={i} style={{ padding: "4px 12px", whiteSpace: "nowrap" }}>
                  {\`第 \${i} 条公告\`}
                </span>
              ))}
            </XhMarqueeContent>
          </XhMarqueeRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
