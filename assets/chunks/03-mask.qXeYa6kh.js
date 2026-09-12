const n=`// 遮蔽与字符类别 | mask 把每格转成密码框，type 决定哪类字符进得来，其余按键既不进值也不留在框里
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <>
      <XhPinInputRoot length={4} mask>
        <XhPinInputLabel>支付密码（遮蔽）</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>

      <XhPinInputRoot length={4} type="alphanumeric">
        <XhPinInputLabel>兑换码（数字与字母）</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
      </XhPinInputRoot>
    </>
  );
}
`;export{n as default};
