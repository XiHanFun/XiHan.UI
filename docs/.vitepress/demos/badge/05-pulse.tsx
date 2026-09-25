// 呼吸 | pulse 让圆点呼吸，表达正在进行、给不出进度的状态；状态仍要写在文字里，减弱动效下圆点停在满亮
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarRoot, XhBadge, XhButton } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <XhBadge dot pulse tone="danger" label="录制中">
        <XhButton variant="outline">录制中</XhButton>
      </XhBadge>

      <XhBadge dot pulse tone="success" placement="bottom-end" label="通话中">
        <XhAvatarRoot>
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>
    </div>
  );
}
