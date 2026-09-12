const n=`// 确定进度 | 传了 value 就由宿主说了算，宽度照它显示，内部爬升不再插手；loading 仍然负责露面与收起
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
  const [value, setValue] = useState(0);

  function start(): void {
    setValue(0);
    setLoading(true);
  }

  function advance(): void {
    setValue(current => Math.min(100, current + 25));
  }

  return (
    <>
      <XhLoadingBarRoot loading={loading} value={value}>
        <XhLoadingBarTrack>
          <XhLoadingBarRange />
        </XhLoadingBarTrack>
      </XhLoadingBarRoot>

      <XhButton variant="solid" onClick={start}>开始</XhButton>
      <XhButton variant="outline" onClick={advance}>推进 25%</XhButton>
      <XhButton variant="ghost" onClick={() => setLoading(false)}>结束</XhButton>
      <span>{\`进度：\${value}%\`}</span>
    </>
  );
}
`;export{n as default};
