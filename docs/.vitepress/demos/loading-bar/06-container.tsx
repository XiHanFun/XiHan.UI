// 挂在局部 | 条子默认贴视口顶边，改写成 absolute 再套一个相对定位的框子，它就只贴这块卡片的上沿
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/react";
import { useState } from "react";

const frame: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  inlineSize: "100%",
  maxInlineSize: "420px",
  border: "1px solid var(--xh-border-subtle)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);

  function reload(): void {
    setLoading(true);
    window.setTimeout(setLoading, 1600, false);
  }

  return (
    <div style={frame}>
      <XhLoadingBarRoot loading={loading} height={3} style={{ position: "absolute" }}>
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <div style={{ display: "grid", gap: "10px", padding: "16px" }}>
        <span>这块卡片自己的加载条，不会跑到页面最上方</span>
        <XhButton size="sm" variant="outline" onClick={reload}>刷新本卡片</XhButton>
      </div>
    </div>
  );
}
