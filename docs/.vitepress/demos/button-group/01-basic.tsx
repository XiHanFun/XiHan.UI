// 基础用法 | 一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    // 段就是组的直接子节点；形态写在组上，组内每段都取得到
    <XhButtonGroup variant="outline">
      {views.map(v => <XhButton key={v}>{v}</XhButton>)}
    </XhButtonGroup>
  );
}
