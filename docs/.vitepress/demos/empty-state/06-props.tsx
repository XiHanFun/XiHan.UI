// props 写法 | 不写结构时按标准结构铺：标题与说明两个属性写出一块空状态，图标与操作用同名插槽
import type { ReactNode } from "react";
import { XhButton, XhEmptyStateRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhEmptyStateRoot
      title="还没有任何工单"
      description="新建一条工单，或者换个筛选条件再看看。"
      indicator="∅"
      action={<XhButton variant="solid">新建工单</XhButton>}
      style={{ inlineSize: "100%" }}
    />
  );
}
