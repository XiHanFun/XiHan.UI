const e=`// 自定义颜色 | 开态轨道、关态轨道与滑块各是一个组件令牌，语气档之外的配色写在行内
import type { CSSProperties, ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {/* 只换开态轨道色 */}
      <XhSwitch defaultChecked style={{ "--xh-switch-bg-checked": "#16a34a" } as CSSProperties} />

      {/* 开关两态各给一色 */}
      <XhSwitch style={{ "--xh-switch-bg": "#2080f0", "--xh-switch-bg-checked": "#d03050" } as CSSProperties} />

      {/* 滑块也是一个令牌，可以和轨道拉开对比 */}
      <XhSwitch
        defaultChecked
        style={{ "--xh-switch-bg-checked": "#1f2937", "--xh-switch-thumb": "#facc15" } as CSSProperties}
      />
    </div>
  );
}
`;export{e as default};
