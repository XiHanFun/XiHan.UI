// 溢出才提示 | 上面套 Tooltip 按 overflow-change 开关，下面用 tooltip 交给平台的原生提示
import type { CSSProperties, ReactNode } from "react";
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
  XhTruncate,
} from "@xihan-ui/react";
import { useState } from "react";

const text = "配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室";

// 触发器本身是按钮，这里让它按普通文字那样铺满一行
const asText: CSSProperties = {
  display: "block",
  inlineSize: "100%",
  padding: "0",
  border: "0",
  background: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "start",
  cursor: "default",
};

export default function Demo(): ReactNode {
  const [width, setWidth] = useState(200);
  const [overflowing, setOverflowing] = useState(false);

  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        容器宽度
        <input
          type="range"
          min="120"
          max="560"
          step="20"
          value={width}
          onChange={e => setWidth(Number(e.target.value))}
        />
        {`${width}px`}
      </label>

      {/* 组件只报「被裁了没有」，浮层归 Tooltip；没被裁时把提示整个关掉 */}
      <div style={{ inlineSize: `${width}px`, maxInlineSize: "100%" }}>
        <XhTooltipRoot disabled={!overflowing}>
          <XhTooltipTrigger style={asText}>
            <XhTruncate onOverflowChange={details => setOverflowing(details.overflowing)}>
              {text}
            </XhTruncate>
          </XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>{text}</XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      </div>

      {/* 不想要浮层就开 tooltip：被裁时整段文字写进 title，交给平台自己的提示 */}
      <div style={{ inlineSize: `${width}px`, maxInlineSize: "100%" }}>
        <XhTruncate tooltip>{text}</XhTruncate>
      </div>
    </div>
  );
}
