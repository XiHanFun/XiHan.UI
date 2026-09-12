const e=`// 尺寸 | size 换的是字号与键帽的内边距，三档与其余控件同源
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {/* 三枚都是纯展示组合，不会安装任何监听 */}
      <XhKbdGroup keys={["Mod", "1"]} size="sm" />
      <XhKbdGroup keys={["Mod", "2"]} size="md" />
      <XhKbdGroup keys={["Mod", "3"]} size="lg" />
    </div>
  );
}
`;export{e as default};
