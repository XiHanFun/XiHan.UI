const n=`// 厚度与颜色 | height 数字按像素、字符串按任意 CSS 长度；color 只改进度段的底色
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
      <XhLoadingBarRoot loading={loading} height={6} color="#f97316">
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <XhButton variant="solid" onClick={() => setLoading(true)}>开始加载</XhButton>
      <XhButton variant="outline" onClick={() => setLoading(false)}>结束加载</XhButton>
      <span>6px 厚的橙色条子，仍然贴在视口顶边</span>
    </>
  );
}
`;export{n as default};
