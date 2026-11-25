// 形态、尺寸与状态 | variant 在默认与幽灵两种外观之间切换；size 提供三种尺寸，仅图标的按钮一起换档；禁用保留禁用前的按下状态
import type { CSSProperties, ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--xh-space-3)" };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={rowStyle}>
        <XhToggle defaultPressed>
          <XhIcon icon={HeartIcon} />
          默认
        </XhToggle>
        <XhToggle variant="ghost">
          <XhIcon icon={HeartIcon} />
          幽灵
        </XhToggle>
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        <div style={rowStyle}>
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
        <div style={rowStyle}>
          <XhToggle iconOnly aria-label="小号点赞" size="sm"><XhIcon icon={HeartIcon} /></XhToggle>
          <XhToggle iconOnly aria-label="中号点赞"><XhIcon icon={HeartIcon} /></XhToggle>
          <XhToggle iconOnly aria-label="大号点赞" size="lg"><XhIcon icon={HeartIcon} /></XhToggle>
        </div>
      </div>

      <div style={rowStyle}>
        <XhToggle disabled>
          <XhIcon icon={HeartIcon} />
          点赞
        </XhToggle>
        <XhToggle disabled defaultPressed>
          <XhIcon icon={HeartIcon} />
          点赞
        </XhToggle>
      </div>
    </div>
  );
}
