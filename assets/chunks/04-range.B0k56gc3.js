const n=`// 区间输入 | 组里放两个输入框，中间夹一个前后缀块当连接词：三段共用两条中缝，圆角只留在最外两端；两头各自带 aria-label，读屏分得清哪个是起点
import type { ReactNode } from "react";
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [min, setMin] = useState("100");
  const [max, setMax] = useState("800");

  function summarize(): string {
    if (!min && !max) {
      return "不限";
    }
    if (!min) {
      return \`\${max} 元以下\`;
    }
    if (!max) {
      return \`\${min} 元以上\`;
    }
    return \`\${min} — \${max} 元\`;
  }

  return (
    <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
      <XhInputGroupRoot>
        <XhInputGroupItem>￥</XhInputGroupItem>
        <XhTextFieldRoot
          value={min}
          onValueChange={details => setMin(details.value)}
          placeholder="最低价"
        >
          <XhTextFieldControl>
            <XhTextFieldInput aria-label="最低价" />
          </XhTextFieldControl>
        </XhTextFieldRoot>
        {/* 连接词也是一段：与两侧同高、同一条描边，它是这个盒的一部分 */}
        <XhInputGroupItem>至</XhInputGroupItem>
        <XhTextFieldRoot
          value={max}
          onValueChange={details => setMax(details.value)}
          placeholder="最高价"
        >
          <XhTextFieldControl>
            <XhTextFieldInput aria-label="最高价" />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhInputGroupRoot>

      <p style={{ fontSize: "13px", opacity: 0.75 }}>{\`价格区间：\${summarize()}\`}</p>
    </div>
  );
}
`;export{n as default};
