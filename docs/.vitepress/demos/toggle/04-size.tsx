// 尺寸 | 提供三种尺寸
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhToggle size="sm">
          <XhIcon icon={HeartIcon} />
          小
        </XhToggle>
        <XhToggle>
          <XhIcon icon={HeartIcon} />
          中
        </XhToggle>
        <XhToggle size="lg">
          <XhIcon icon={HeartIcon} />
          大
        </XhToggle>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhToggle iconOnly aria-label="小号点赞" size="sm"><XhIcon icon={HeartIcon} /></XhToggle>
        <XhToggle iconOnly aria-label="中号点赞"><XhIcon icon={HeartIcon} /></XhToggle>
        <XhToggle iconOnly aria-label="大号点赞" size="lg"><XhIcon icon={HeartIcon} /></XhToggle>
      </div>
    </div>
  );
}
