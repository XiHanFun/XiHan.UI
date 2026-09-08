// 外形与贴边 | shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [shape, setShape] = useState<"circle" | "square">("circle");
  const [offset, setOffset] = useState(16);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          外形
          <select value={shape} onChange={event => setShape(event.target.value as "circle" | "square")}>
            <option value="circle">circle</option>
            <option value="square">square</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          贴边
          <input
            type="range"
            min="0"
            max="48"
            step="4"
            value={offset}
            onChange={event => setOffset(Number(event.target.value))}
          />
          {`${offset}px`}
        </label>
      </div>

      <div
        style={{
          position: "relative",
          blockSize: "260px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        {/* 展开的每一条动作与触发器同一副身量，圆角跟着 shape 一起换 */}
        <XhFloatButtonRoot
          style={{ position: "absolute" }}
          shape={shape}
          offset={offset}
          translations={{ trigger: "更多操作" }}
          defaultOpen
        >
          <XhFloatButtonTrigger />
          <XhFloatButtonList>
            <button type="button" title="编辑">✎</button>
            <button type="button" title="分享">↗</button>
            <button type="button" title="删除">🗑</button>
          </XhFloatButtonList>
        </XhFloatButtonRoot>
      </div>
    </div>
  );
}
