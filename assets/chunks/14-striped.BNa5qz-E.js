const e=`// 条纹 | striped 在填充上铺一层斜纹，进行中沿行向流动，完成后静止；减弱动效下不流动
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhProgress value={45} striped aria-label="导出进度" />
      <XhProgress value={100} striped tone="success" aria-label="已完成的导出" />
    </div>
  );
}
`;export{e as default};
