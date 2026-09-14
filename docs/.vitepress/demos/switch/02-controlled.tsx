// 受控 | 传了 checked 就由宿主说了算，组件自己不再改状态；变化意图从 checked-change 出来，写回才落位
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
