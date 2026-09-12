// 基础用法 | 组合相关操作
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const views = ["照片", "视频", "更多"];

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup>
      {views.map(view => <XhButton key={view}>{view}</XhButton>)}
    </XhButtonGroup>
  );
}
