const e=`// 禁用与只读 | 区分不可用与不可修改状态
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhCheckbox disabled>禁用</XhCheckbox>
      <XhCheckbox defaultChecked disabled>已选中且禁用</XhCheckbox>
      <XhCheckbox defaultChecked readOnly>只读</XhCheckbox>
    </div>
  );
}
`;export{e as default};
