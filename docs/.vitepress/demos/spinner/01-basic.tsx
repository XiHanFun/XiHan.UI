// 基础用法 | root 是 role=status 的活区，旋转图形由皮肤绘制在伪元素上；label 给出该处在等待什么
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSpinner label="加载中" />
  );
}
