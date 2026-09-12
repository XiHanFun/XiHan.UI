// 图标 | 支持图标标签和仅图标按钮
import type { ReactNode } from "react";
import { EyeIcon, StarIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggle defaultPressed>
        <XhIcon icon={StarIcon} />
        收藏
      </XhToggle>
      <XhToggle iconOnly aria-label="显示预览">
        <XhIcon icon={EyeIcon} />
      </XhToggle>
    </>
  );
}
