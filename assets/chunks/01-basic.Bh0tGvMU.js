const t=`// 基础用法 | 标签在上、数值在下；数值由你自己格式化好再塞进来，组件不做千分位也不做换算
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
`;export{t as default};
