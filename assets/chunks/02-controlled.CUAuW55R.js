const e=`// 受控 | 传入 checked 后由宿主决定，组件自身不再修改状态；变化意图经 checked-change 发出，写回后才落位
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [checked, setChecked] = useState(true);

  return (
    <>
      <XhSwitch
        checked={checked}
        onCheckedChange={details => setChecked(details.checked)}
      />
      <span>
        当前：
        {checked ? "开" : "关"}
      </span>
    </>
  );
}
`;export{e as default};
