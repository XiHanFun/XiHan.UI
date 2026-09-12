const e=`// 撤掉与换色 | 文字空了就落 data-state="empty"，整层不画；印子的颜色走 --xh-watermark-fg，深浅主题各自跟着走
import type { CSSProperties, ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
        <input type="checkbox" checked={on} onChange={event => setOn(event.target.checked)} />
        盖上水印
      </label>
      {/* 图样当遮罩用，颜色由这一个变量决定；写成背景图就得把颜色焊死在图里 */}
      <XhWatermarkRoot
        text={on ? "曦寒 · 机密" : ""}
        style={{
          "--xh-watermark-fg": "var(--xh-fg-danger)",
          "border": "1px solid var(--xh-border-default)",
          "borderRadius": "6px",
        } as CSSProperties}
      >
        <XhWatermarkContent>
          <div style={{ padding: "24px", blockSize: "180px", lineHeight: 1.9 }}>
            <p>取消勾选后 root 落 data-state="empty"，印子那一层整层不画。</p>
          </div>
        </XhWatermarkContent>
      </XhWatermarkRoot>
    </div>
  );
}
`;export{e as default};
