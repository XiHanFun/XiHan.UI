// 厚度 | height 数字按像素、字符串按任意 CSS 长度；进度段的颜色经语气或皮肤槽，不使用内联
import type { ReactNode } from "react";
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <XhLoadingBarRoot loading={loading} height={6} tone="warning">
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <XhButton variant="solid" onClick={() => setLoading(true)}>开始加载</XhButton>
      <XhButton variant="outline" onClick={() => setLoading(false)}>结束加载</XhButton>
      <span>6px 厚的警示色条子，仍然贴在视口顶边</span>
    </>
  );
}
