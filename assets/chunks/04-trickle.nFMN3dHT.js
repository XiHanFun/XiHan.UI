const n=`// 关掉爬升 | trickle 为 false 时条子停在起步值 minimum 不动，往前走全靠宿主收尾
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
      <XhLoadingBarRoot loading={loading} trickle={false} minimum={30} height={6}>
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <XhButton variant="solid" onClick={() => setLoading(true)}>开始加载</XhButton>
      <XhButton variant="outline" onClick={() => setLoading(false)}>结束加载</XhButton>
      <span>开始后停在 30%，按「结束加载」才冲到 100 并淡出</span>
    </>
  );
}
`;export{n as default};
