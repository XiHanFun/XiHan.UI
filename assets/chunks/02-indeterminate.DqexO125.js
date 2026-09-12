const e=`// 三态 | checked 传 "indeterminate" 表示部分选中，它不是第三个稳定态：点一下就落到 true
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");

  return (
    <>
      <XhCheckbox checked={checked} onCheckedChange={details => setChecked(details.checked)} />
      <span>
        当前：
        {String(checked)}
      </span>
    </>
  );
}
`;export{e as default};
