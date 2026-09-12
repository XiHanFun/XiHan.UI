// 禁用 | 保留禁用前的状态
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggle disabled>
        <XhIcon icon={HeartIcon} />
        点赞
      </XhToggle>
      <XhToggle disabled defaultPressed>
        <XhIcon icon={HeartIcon} />
        点赞
      </XhToggle>
    </>
  );
}
