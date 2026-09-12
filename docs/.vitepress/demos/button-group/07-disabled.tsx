// 禁用 | 禁用整组按钮
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup disabled>
      <XhButton>照片</XhButton>
      <XhButton>视频</XhButton>
      <XhButton>更多</XhButton>
    </XhButtonGroup>
  );
}
