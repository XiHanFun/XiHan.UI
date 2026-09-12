const n=`// 点击事件 | 处理器照常挂在组件上；载入态与禁用态的点击在根上就被拦下，作者挂的处理器也收不到
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);
  const bump = (): void => setCount(n => n + 1);

  return (
    <>
      <XhButton variant="solid" onClick={bump}>点一下</XhButton>
      <XhButton loading onClick={bump}>载入中</XhButton>
      <XhButton disabled onClick={bump}>禁用</XhButton>
      <span style={{ fontSize: "13px" }}>{\`已计数 \${count} 次\`}</span>
    </>
  );
}
`;export{n as default};
