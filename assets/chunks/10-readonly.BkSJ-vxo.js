const n=`// 只读 | 格子带上原生 readonly，值走受控且宿主不回写：能聚焦、能选中复制，改不动
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

// 传了 value 就由宿主说了算，不回写值就恒定不变
const code = ["8", "1", "9", "2"];

// 皮肤没有只读档，底色由作者压下去表示改不动
const box = { background: "var(--xh-bg-subtle)" };

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <>
      <XhPinInputRoot length={4} value={code}>
        <XhPinInputLabel>上一次的验证码</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => (
            <XhPinInputInput
              key={i}
              index={i}
              style={box}
              readOnly
            />
          ))}
        </div>
      </XhPinInputRoot>
      <span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
    </>
  );
}
`;export{n as default};
