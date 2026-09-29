const n=`// 全屏水印 | 固定铺满整个视口，压在页面一切内容之上
import type { ReactNode } from "react";
import { XhButton, XhWatermarkRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [on, setOn] = useState(false);

  return (
    <>
      <XhButton variant="outline" onClick={() => setOn(!on)}>{on ? "撤下全屏水印" : "铺上全屏水印"}</XhButton>
      {on ? <XhWatermarkRoot fullscreen text="XiHan · 内部资料" /> : null}
    </>
  );
}
`;export{n as default};
