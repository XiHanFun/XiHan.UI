// 变体 | variant 只改皮肤的几个颜色槽位，行为完全一致
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton variant="solid">主要</XhButton>
      <XhButton variant="outline">描边</XhButton>
      <XhButton variant="ghost">幽灵</XhButton>
    </>
  );
}
