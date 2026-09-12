const n=`// 平台写法 | 同一份 keys 两套写法：Mac 出符号且键帽连排，其余平台出单词并用加号连接
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

const combo = ["Mod", "Shift", "P"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {/* 显式写 platform 时以它为准，实测值不再插手；纯展示不会安装监听 */}
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Mac</span>
        <XhKbdGroup keys={combo} platform="mac" />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>其余平台</span>
        <XhKbdGroup keys={combo} platform="other" />
      </span>
    </div>
  );
}
`;export{n as default};
