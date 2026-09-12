const e=`// 语气与尺寸 | tone 决定按钮用哪族颜色，size 换一档尺寸；translations 换掉读屏念出的名字
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useState } from "react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;

const boxStyle: CSSProperties = {
  blockSize: "220px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [tone, setTone] = useState<(typeof tones)[number]>("brand");
  const [size, setSize] = useState<(typeof sizes)[number]>("md");

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", gap: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          语气
          <select
            value={tone}
            onChange={event => setTone(event.target.value as (typeof tones)[number])}
          >
            {tones.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          尺寸
          <select
            value={size}
            onChange={event => setSize(event.target.value as (typeof sizes)[number])}
          >
            {sizes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ position: "relative" }}>
        <div ref={setScrollEl} style={boxStyle}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{\`第 \${i} 段内容。\`}</p>
          ))}
        </div>

        <XhBackTopRoot
          target={scrollEl}
          tone={tone}
          size={size}
          visibilityHeight={40}
          translations={{ trigger: "回到顶部" }}
          style={rootStyle}
        >
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>
    </div>
  );
}
`;export{e as default};
