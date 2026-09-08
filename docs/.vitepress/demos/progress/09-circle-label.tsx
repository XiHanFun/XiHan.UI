// 环心文字 | 组件只负责把内容摆到环心，写什么由使用者决定
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon, XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <XhProgress variant="circle" value={72}>
        <strong style={{ fontSize: "20px" }}>72%</strong>
      </XhProgress>

      {/* 进度不是百分比时补一句 value-text：读屏念到的要和眼睛看到的一致 */}
      <XhProgress variant="circle" value={3} max={8} valueText="第 3 步，共 8 步">
        <span>3 / 8</span>
      </XhProgress>

      <XhProgress variant="circle" value={100} tone="success">
        <span style={{ fontSize: "24px" }}><XhIcon icon={CheckIcon} /></span>
      </XhProgress>
    </div>
  );
}
