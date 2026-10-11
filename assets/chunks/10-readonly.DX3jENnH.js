var e=`// 只读 | 格子带上原生 readonly，值受控且宿主不回写：可聚焦、可选中复制，不可修改
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

// 传了 value 就由宿主说了算，不回写值就恒定不变
const code = ["8", "1", "9", "2"];

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <>
      <XhPinInputRoot length={4} value={code} readOnly>
        <XhPinInputLabel>上一次的验证码</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>
      <span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
    </>
  );
}
`;export{e as default};