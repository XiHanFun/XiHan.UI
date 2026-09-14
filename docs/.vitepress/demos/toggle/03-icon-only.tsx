// 仅图标 | 为每个图标按钮提供可访问名称
import type { ReactNode } from "react";
import { BookmarkIcon, HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggle iconOnly aria-label="点赞">
        <XhIcon icon={HeartIcon} />
      </XhToggle>
      <XhToggle iconOnly aria-label="收藏" variant="ghost">
        <XhIcon icon={BookmarkIcon} />
      </XhToggle>
    </>
  );
}
