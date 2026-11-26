// props 写法 | 不写结构时按标准结构铺：标题与说明两个属性写出一条提示，图标与操作用同名插槽
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import { XhAlertRoot, XhButton, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot title="部署已排队" description="构建完成后会自动发布。" />

      <XhAlertRoot
        tone="success"
        title="发布完成"
        description="三个节点都已切到新版本。"
        indicator={<XhIcon icon={CheckIcon} />}
        action={<XhButton size="sm" variant="outline">查看详情</XhButton>}
      />
    </div>
  );
}
