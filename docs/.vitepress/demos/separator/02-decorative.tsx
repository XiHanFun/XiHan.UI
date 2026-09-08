// 纯装饰 | decorative 开启后读屏跳过它；只是排版用的横线应该这么写
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%" }}>
      <p>语义分隔：读屏会念出一条分隔线</p>
      <XhSeparator />
      <p>装饰分隔：读屏跳过</p>
      <XhSeparator decorative />
      <p>末段</p>
    </div>
  );
}
