const n=`// 基础用法 | 挂载即从 from 变化到 to，三个尺寸档只改变字号；不写 size 即跟随上下文的字号
import type { ReactNode } from "react";
import { XhNumberAnimation } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhNumberAnimation from={0} to={1024} size="sm" />
      <XhNumberAnimation from={0} to={12480} size="md" />
      <XhNumberAnimation from={0} to={98600} size="lg" tone="brand" />
    </>
  );
}
`;export{n as default};
