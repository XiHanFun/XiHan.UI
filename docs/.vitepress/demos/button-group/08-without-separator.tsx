// 无分隔线 | 省略分隔线部件
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup split={false}>
      <XhButton>照片</XhButton>
      <XhButton>视频</XhButton>
      <XhButton>更多</XhButton>
    </XhButtonGroup>
  );
}
