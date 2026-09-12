// 尺寸 | 小、中、大三档
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton size="sm">小尺寸</XhButton>
      <XhButton>中尺寸</XhButton>
      <XhButton size="lg">大尺寸</XhButton>
    </>
  );
}
