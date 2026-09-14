// 加载失败回退 | 图片地址取不到时切到 fallback，切换由状态机决定而不是 CSS
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhAvatarRoot src="/images/does-not-exist.png" alt="取不到的图">
        <XhAvatarImage />
        <XhAvatarFallback>回退</XhAvatarFallback>
      </XhAvatarRoot>

      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>无图</XhAvatarFallback>
      </XhAvatarRoot>
    </>
  );
}
