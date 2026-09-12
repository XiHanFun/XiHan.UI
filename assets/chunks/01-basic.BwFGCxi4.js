const a=`// 基础用法 | 图片加载失败或未提供时落到 fallback
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhAvatarRoot src="/images/logo.png" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>

      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>
    </>
  );
}
`;export{a as default};
