// 基础用法 | 标签在上、数值在下；手写部件时数值由作者格式化好放进 value 部件，组件原样显示
import type { ReactNode } from "react";
import { XhStatisticLabel, XhStatisticRoot, XhStatisticValue } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhStatisticRoot>
      <XhStatisticLabel>本月新增用户</XhStatisticLabel>
      <XhStatisticValue>12,480</XhStatisticValue>
    </XhStatisticRoot>
  );
}
