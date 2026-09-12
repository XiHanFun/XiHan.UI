// 重复铺满 | autoFill 在轨道里铺两份内容，走完一份第二份正好压在起点上，看不出接缝；不开则整段走完再回来
import type { ReactNode } from "react";
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/react";

const tags = ["多租户", "字段级脱敏", "动态 API", "工作流", "代码生成"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[false, true].map(fill => (
        <div key={String(fill)}>
          <p style={{ marginBlockEnd: "8px", fontSize: "12px" }}>
            {fill ? "autoFill：一圈只走一份，接缝处始终有内容" : "不开：整段走出窗口后再从另一侧进来"}
          </p>
          <XhMarqueeRoot
            autoFill={fill}
            speed={60}
            style={{ maxInlineSize: "420px", border: "1px solid var(--xh-border-default)", borderRadius: "6px" }}
          >
            <XhMarqueeContent>
              {tags.map(t => (
                <span key={t} style={{ padding: "6px 14px", whiteSpace: "nowrap" }}>{t}</span>
              ))}
            </XhMarqueeContent>
          </XhMarqueeRoot>
        </div>
      ))}
    </div>
  );
}
