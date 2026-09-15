const n=`// 分组排布 | 格子由作者逐个写出，中间插什么都行；下标接着排，跳格与整串粘贴仍按文档序走
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const head = [0, 1, 2];
const tail = [3, 4, 5];

export default function Demo(): ReactNode {
  return (
    <XhPinInputRoot length={6} type="alphanumeric" placeholder="·">
      <XhPinInputLabel>邀请码（3 + 3）</XhPinInputLabel>
      <div style={{ display: "flex", alignItems: "center" }}>
        {head.map(i => <XhPinInputInput key={\`a\${i}\`} index={i} />)}
        <span style={{ marginInline: "8px" }}>—</span>
        {tail.map(i => <XhPinInputInput key={\`b\${i}\`} index={i} />)}
      </div>
    </XhPinInputRoot>
  );
}
`;export{n as default};
